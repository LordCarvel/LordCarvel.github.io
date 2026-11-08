import { describe, expect, it } from 'vitest'
import { matchShortcut, type KeyInput } from './shortcuts'

const shortcuts = [
  { key: '1', target: 'projetos' },
  { key: '4', target: 'contato' },
]

function press(key: string, extra: Partial<KeyInput> = {}): KeyInput {
  return { key, ctrlKey: false, metaKey: false, altKey: false, typing: false, ...extra }
}

describe('matchShortcut', () => {
  it('tecla do atalho devolve o destino', () => {
    expect(matchShortcut(press('1'), shortcuts)).toBe('projetos')
    expect(matchShortcut(press('4'), shortcuts)).toBe('contato')
  })

  it('tecla sem atalho devolve null', () => {
    expect(matchShortcut(press('2'), shortcuts)).toBeNull()
  })

  it('não dispara enquanto a pessoa digita', () => {
    expect(matchShortcut(press('1', { typing: true }), shortcuts)).toBeNull()
  })

  it('não rouba combinações do navegador', () => {
    expect(matchShortcut(press('1', { ctrlKey: true }), shortcuts)).toBeNull()
    expect(matchShortcut(press('1', { metaKey: true }), shortcuts)).toBeNull()
    expect(matchShortcut(press('1', { altKey: true }), shortcuts)).toBeNull()
  })
})
