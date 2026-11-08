import { describe, expect, it, vi } from 'vitest'
import { runLine } from './commands'
import { findDir } from './fs'
import { globToRegExp } from './fsCommands'
import { fakeCtx, fs, run } from './testing'

describe('pwd e cd', () => {
  it('pwd mostra o caminho da pasta atual', () => {
    expect(run('pwd')).toEqual(['~'])
    expect(run('pwd', fakeCtx({ cwd: 'projetos', lang: 'en' }))).toEqual(['~/projects'])
  })

  it('cd entra na pasta e não imprime nada', () => {
    const ctx = fakeCtx()
    expect(run('cd projetos', ctx)).toEqual([])
    expect(ctx.setCwd).toHaveBeenCalledWith(findDir(fs, 'projetos'))
  })

  it('cd .. e cd sozinho voltam para a raiz', () => {
    for (const input of ['cd ..', 'cd', 'cd ~']) {
      const ctx = fakeCtx({ cwd: 'projetos' })
      runLine(input, ctx)
      expect(ctx.setCwd).toHaveBeenCalledWith(fs)
    }
  })

  it('cd em arquivo ou caminho inexistente dá erro sem mudar a pasta', () => {
    const ctx = fakeCtx()
    expect(run('cd sobre.md', ctx)).toEqual(['cd: sobre.md: não é um diretório'])
    expect(run('cd nada', ctx)).toEqual(['cd: nada: arquivo ou diretório não encontrado'])
    expect(ctx.setCwd).not.toHaveBeenCalled()
  })
})

describe('ls', () => {
  it('lista a pasta atual numa linha, pastas com /', () => {
    const [out] = run('ls')
    expect(out).toContain('perfil.md')
    expect(out).toContain('projetos/')
  })

  it('lista outra pasta pelo caminho', () => {
    expect(run('ls projetos')[0]).toContain('Cdatra.java')
  })

  it('-l mostra uma linha por item, com permissões', () => {
    const out = run('ls -l projetos')
    expect(out.length).toBe(findDir(fs, 'projetos').children!.length)
    expect(out[0]).toMatch(/^-rw-r--r-- +\d+ {2}Cdatra\.java$/)
  })

  it('-la inclui . e ..', () => {
    const out = run('ls -la')
    expect(out[0]).toMatch(/^drwxr-xr-x .* \.$/)
    expect(out[1]).toMatch(/ \.\.$/)
  })

  it('a pasta no ls é clicável e roda cd', () => {
    const spans = runLine('ls', fakeCtx()).lines[0]
    expect(spans.find((sp) => sp.text === 'projetos/')?.run).toBe('cd ~/projetos')
  })
})

describe('cat e open', () => {
  it('cat mostra as linhas do arquivo', () => {
    expect(run('cat sobre.md')[0]).toBe('# Sobre')
  })

  it('cat em pasta e em arquivo inexistente dá erro', () => {
    expect(run('cat projetos')).toEqual(['cat: projetos: é um diretório'])
    expect(run('cat nada')).toEqual(['cat: nada: arquivo ou diretório não encontrado'])
  })

  it('open abre a página do arquivo', () => {
    const ctx = fakeCtx({ cwd: 'projetos' })
    run('vim Cdatra.java', ctx)
    expect(ctx.open).toHaveBeenCalledWith('cdatra')
  })
})

describe('tree e find', () => {
  it('tree desenha a árvore e conta pastas e arquivos', () => {
    const out = run('tree')
    expect(out[0]).toBe('.')
    expect(out).toContain('├── perfil.md')
    expect(out.at(-1)).toMatch(/^1 pasta, \d+ arquivos$/)
  })

  it('find -name filtra por glob', () => {
    expect(run("find -name '*.java'")).toEqual(['projetos/Cdatra.java'])
  })

  it('globToRegExp entende * e ? e escapa o resto', () => {
    expect(globToRegExp('*.md').test('sobre.md')).toBe(true)
    expect(globToRegExp('*.md').test('sobremd')).toBe(false)
    expect(globToRegExp('s?bre.md').test('sobre.md')).toBe(true)
  })
})

describe('setCwd é chamado com a pasta certa mesmo em inglês', () => {
  it('cd projects funciona com a interface em português', () => {
    const ctx = fakeCtx()
    ctx.setCwd = vi.fn()
    run('cd projects', ctx)
    expect(ctx.setCwd).toHaveBeenCalledWith(findDir(fs, 'projetos'))
  })
})
