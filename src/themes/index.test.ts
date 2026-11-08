import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME, LIGHT_THEME, THEMES, detectTheme, isTheme, stepTheme } from './index'

describe('detectTheme', () => {
  it('o tema salvo vence', () => {
    expect(detectTheme({ saved: 'tokyo-night', prefersLight: true })).toBe('tokyo-night')
  })

  it('sem salvo, segue o modo do sistema', () => {
    expect(detectTheme({ saved: null, prefersLight: true })).toBe(LIGHT_THEME)
    expect(detectTheme({ saved: null, prefersLight: false })).toBe(DEFAULT_THEME)
  })

  it('ignora um tema salvo que não existe mais', () => {
    expect(detectTheme({ saved: 'dracula', prefersLight: false })).toBe(DEFAULT_THEME)
  })
})

describe('stepTheme', () => {
  it('anda e dá a volta nas duas pontas', () => {
    expect(stepTheme(THEMES[0].id, 1)).toBe(THEMES[1].id)
    expect(stepTheme(THEMES[0].id, -1)).toBe(THEMES.at(-1)!.id)
    expect(stepTheme(THEMES.at(-1)!.id, 1)).toBe(THEMES[0].id)
  })
})

describe('isTheme', () => {
  it('só aceita ids da lista', () => {
    expect(isTheme('workspace')).toBe(true)
    expect(isTheme('WORKSPACE')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })
})
