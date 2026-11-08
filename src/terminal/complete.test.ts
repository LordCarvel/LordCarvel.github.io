import { describe, expect, it } from 'vitest'
import { commandNames } from './commands'
import { commonPrefix, complete } from './complete'
import { findDir } from './fs'
import { fs } from './testing'

const ctx = { fs, cwd: fs, lang: 'pt' as const, commandNames: commandNames() }

describe('commonPrefix', () => {
  it('acha o começo em comum', () => {
    expect(commonPrefix(['head', 'help', 'history'])).toBe('h')
    expect(commonPrefix(['sobre.md', 'sobre.txt'])).toBe('sobre.')
    expect(commonPrefix([])).toBe('')
  })
})

describe('complete', () => {
  it('uma opção de comando completa e põe espaço', () => {
    expect(complete('pw', ctx)).toEqual({ value: 'pwd ', options: [] })
  })

  it('várias opções completam o comum e devolvem a lista', () => {
    const r = complete('h', ctx)
    expect(r.value).toBe('h')
    expect(r.options).toEqual(expect.arrayContaining(['head', 'help', 'history']))
  })

  it('caminho: pasta completa com / para continuar', () => {
    expect(complete('cd proj', ctx)).toEqual({ value: 'cd projetos/', options: [] })
  })

  it('caminho dentro de pasta', () => {
    expect(complete('cat projetos/Cd', ctx)).toEqual({ value: 'cat projetos/Cdatra.java ', options: [] })
  })

  it('a partir de outra pasta e com ..', () => {
    const inProjects = { ...ctx, cwd: findDir(fs, 'projetos') }
    expect(complete('cat ../sob', inProjects)).toEqual({ value: 'cat ../sobre.md ', options: [] })
  })

  it('sem opção não muda nada', () => {
    expect(complete('cat xyz', ctx)).toEqual({ value: 'cat xyz', options: [] })
    expect(complete('cat nada/x', ctx)).toEqual({ value: 'cat nada/x', options: [] })
  })

  it('usa os nomes na língua atual', () => {
    expect(complete('cd proj', { ...ctx, lang: 'en' }).value).toBe('cd projects/')
  })
})
