import { describe, expect, it } from 'vitest'
import { isPaletteKey, matchShortcut, type KeyInput } from './shortcuts'

describe('isPaletteKey', () => {
  const key = (k: string, extra: Partial<KeyInput> = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, ...extra })

  it('Ctrl+K e Cmd+K abrem a busca, com ou sem Shift (K maiúsculo)', () => {
    expect(isPaletteKey(key('k', { ctrlKey: true }))).toBe(true)
    expect(isPaletteKey(key('K', { ctrlKey: true }))).toBe(true)
    expect(isPaletteKey(key('k', { metaKey: true }))).toBe(true)
  })

  it('k sozinho, Alt+Ctrl+K e outras letras não abrem', () => {
    expect(isPaletteKey(key('k'))).toBe(false)
    expect(isPaletteKey(key('k', { ctrlKey: true, altKey: true }))).toBe(false)
    expect(isPaletteKey(key('j', { ctrlKey: true }))).toBe(false)
  })
})

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
