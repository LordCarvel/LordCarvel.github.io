import { describe, expect, it, vi } from 'vitest'
import { lineText } from '../core/buffer'
import { HOME, registry } from '../pages/index'
import { commands, findCommand, runLine, type CommandContext } from './commands'

function fakeCtx(extra: Partial<CommandContext> = {}): CommandContext {
  return { lang: 'pt', registry, open: vi.fn(), setLang: vi.fn(), cmdHistory: [], ...extra }
}

const text = (input: string, ctx = fakeCtx()) => runLine(input, ctx).lines.map(lineText)

describe('findCommand', () => {
  it('acha pelo nome em pt, em en e pelo apelido, sem diferenciar maiúscula', () => {
    expect(findCommand(commands, 'projetos')).toBe(findCommand(commands, 'PROJECTS'))
    expect(findCommand(commands, 'cls')).toBe(findCommand(commands, 'clear'))
  })

  it('nomes não se repetem entre comandos', () => {
    const all = commands.flatMap((c) => [...new Set([c.names.pt, c.names.en, ...(c.aliases ?? [])])])
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('runLine', () => {
  it('linha vazia não responde nada', () => {
    expect(runLine('   ', fakeCtx())).toEqual({ lines: [] })
  })

  it('comando desconhecido avisa e sugere o help clicável', () => {
    const result = runLine('xyz', fakeCtx())
    expect(lineText(result.lines[0])).toBe('carvel-sh: comando não encontrado: xyz')
    expect(result.lines[1].some((span) => span.run === 'help')).toBe(true)
  })

  it('help lista todos os comandos, cada um clicável', () => {
    const result = runLine('help', fakeCtx({ lang: 'en' }))
    const runs = result.lines.flatMap((l) => l.flatMap((span) => (span.run ? [span.run] : [])))
    expect(runs).toEqual(commands.map((c) => c.names.en))
  })

  it('comando de página abre o buffer certo', () => {
    const ctx = fakeCtx()
    expect(text('sobre', ctx)).toEqual(['abrindo sobre.md'])
    expect(ctx.open).toHaveBeenCalledWith('sobre')
  })

  it('todo comando de página aponta para um buffer que existe', () => {
    const ctx = fakeCtx()
    for (const c of commands) c.run([], ctx)
    for (const [id] of vi.mocked(ctx.open).mock.calls) expect(registry.has(id), id).toBe(true)
    expect(ctx.open).toHaveBeenCalledWith(HOME)
  })

  it('echo junta os argumentos, respeitando aspas', () => {
    expect(text('echo "olá  mundo" !')).toEqual(['olá  mundo !'])
  })

  it('lang troca o idioma e responde na língua nova', () => {
    const ctx = fakeCtx()
    expect(text('lang en', ctx)).toEqual(['language: English'])
    expect(ctx.setLang).toHaveBeenCalledWith('en')
  })

  it('lang sem argumento alterna; com valor inválido mostra o uso', () => {
    const ctx = fakeCtx({ lang: 'en' })
    runLine('lang', ctx)
    expect(ctx.setLang).toHaveBeenCalledWith('pt')
    expect(text('lang fr')).toEqual(['uso: lang [pt|en]'])
  })

  it('history numera os comandos', () => {
    expect(text('history', fakeCtx({ cmdHistory: ['help', 'stack'] }))).toEqual(['   1  help', '   2  stack'])
  })

  it('clear pede para limpar a tela', () => {
    expect(runLine('clear', fakeCtx()).clear).toBe(true)
  })
})
