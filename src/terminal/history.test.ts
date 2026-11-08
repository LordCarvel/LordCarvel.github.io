import { describe, expect, it } from 'vitest'
import { addToHistory, browseHistory } from './history'

describe('addToHistory', () => {
  it('guarda o comando sem espaços nas pontas', () => {
    expect(addToHistory([], '  help ')).toEqual(['help'])
  })

  it('ignora linha vazia e repetição do último', () => {
    expect(addToHistory(['help'], '   ')).toEqual(['help'])
    expect(addToHistory(['help'], 'help')).toEqual(['help'])
  })

  it('repetir um comando mais antigo vale', () => {
    expect(addToHistory(['help', 'clear'], 'help')).toEqual(['help', 'clear', 'help'])
  })

  it('descarta os mais antigos ao passar do limite', () => {
    expect(addToHistory(['a', 'b', 'c'], 'd', 3)).toEqual(['b', 'c', 'd'])
  })

  it('não altera a lista recebida', () => {
    const items = ['a']
    addToHistory(items, 'b')
    expect(items).toEqual(['a'])
  })
})

describe('browseHistory', () => {
  const items = ['help', 'stack', 'clear']

  it('subir a partir da linha nova pega o mais recente', () => {
    expect(browseHistory(items, null, 'up')).toEqual({ cursor: 2, value: 'clear' })
  })

  it('subir de novo pega o anterior e para no mais antigo', () => {
    expect(browseHistory(items, 2, 'up')).toEqual({ cursor: 1, value: 'stack' })
    expect(browseHistory(items, 0, 'up')).toEqual({ cursor: 0, value: 'help' })
  })

  it('descer anda para o mais recente', () => {
    expect(browseHistory(items, 0, 'down')).toEqual({ cursor: 1, value: 'stack' })
  })

  it('descer depois do último volta para a linha nova vazia', () => {
    expect(browseHistory(items, 2, 'down')).toEqual({ cursor: null, value: '' })
    expect(browseHistory(items, null, 'down')).toEqual({ cursor: null, value: '' })
  })

  it('histórico vazio não faz nada', () => {
    expect(browseHistory([], null, 'up')).toEqual({ cursor: null, value: '' })
  })
})
