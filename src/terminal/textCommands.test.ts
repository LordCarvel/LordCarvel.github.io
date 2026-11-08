import { describe, expect, it } from 'vitest'
import { runLine } from './commands'
import { highlight, parseCount } from './textCommands'
import { fakeCtx, run } from './testing'

describe('parseCount', () => {
  it('entende -n 5, -n5 e -5', () => {
    expect(parseCount(['-n', '5', 'a'])).toEqual({ n: 5, rest: ['a'] })
    expect(parseCount(['-n5'])).toEqual({ n: 5, rest: [] })
    expect(parseCount(['-5'])).toEqual({ n: 5, rest: [] })
  })

  it('valor ruim cai no padrão', () => {
    expect(parseCount(['-n', 'abc'])).toEqual({ n: 10, rest: [] })
  })
})

describe('highlight', () => {
  it('marca todas as ocorrências sem diferenciar maiúscula', () => {
    expect(highlight('Java e java', 'JAVA')).toEqual([
      { text: 'Java', kind: 'match' },
      { text: ' e ', kind: 'plain' },
      { text: 'java', kind: 'match' },
    ])
  })
})

describe('grep', () => {
  it('sem arquivo procura em tudo e prefixa com o caminho', () => {
    const out = run('grep reflexão')
    expect(out.length).toBeGreaterThan(0)
    expect(out.every((l) => /^[^:]+:/.test(l) && l.toLowerCase().includes('reflexão'))).toBe(true)
  })

  it('com um arquivo não põe prefixo', () => {
    expect(run('grep Carvel sobre.md')).toEqual(['Sou o Carvel. Meu foco é backend com Java.'])
  })

  it('sem texto para procurar dá erro', () => {
    expect(run('grep')).toEqual(['grep: falta o argumento'])
  })
})

describe('pipes', () => {
  it('o exemplo do guia: grep java | head -3', () => {
    const out = run('grep java | head -3')
    expect(out).toHaveLength(3)
    expect(out.every((l) => l.toLowerCase().includes('java'))).toBe(true)
  })

  it('grep filtra o que chegou pelo pipe', () => {
    expect(run('cat sobre.md | grep foco')).toEqual(['Sou o Carvel. Meu foco é backend com Java.'])
  })

  it('wc -l conta as linhas do pipe', () => {
    const total = run('cat sobre.md').length
    expect(run('cat sobre.md | wc -l')).toEqual([String(total).padStart(4)])
  })

  it('tail pega o fim e sort ordena', () => {
    expect(run('echo b | tail -1')).toEqual(['b'])
    expect(run('ls -l | sort -r')[0]).toMatch(/^drwx/) // pastas (d) depois de arquivos (-) ao contrário
  })

  it('head sem arquivo e sem pipe explica o que falta', () => {
    expect(run('head')).toEqual(['head: sem entrada: passe um arquivo ou use depois de um |'])
  })

  it('comando desconhecido no meio do pipe para tudo', () => {
    expect(run('ls | xyz | wc')[0]).toBe('carvel-sh: comando não encontrado: xyz')
  })

  it('clear em qualquer etapa limpa a tela', () => {
    expect(runLine('echo a | clear', fakeCtx()).clear).toBe(true)
  })
})
