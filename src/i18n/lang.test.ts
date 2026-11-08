import { describe, expect, it } from 'vitest'
import { detectLang, isLang, loc, tr, type Localized } from './lang'

describe('detectLang', () => {
  it('?lang= na URL vence tudo', () => {
    expect(detectLang({ query: 'en', saved: 'pt', browser: 'pt-BR' })).toBe('en')
  })

  it('sem ?lang=, usa o que foi salvo', () => {
    expect(detectLang({ query: null, saved: 'en', browser: 'pt-BR' })).toBe('en')
  })

  it('ignora valores inválidos na URL e no salvo', () => {
    expect(detectLang({ query: 'fr', saved: 'xx', browser: 'pt-BR' })).toBe('pt')
  })

  it('navegador em português vira pt', () => {
    expect(detectLang({ query: null, saved: null, browser: 'pt-PT' })).toBe('pt')
  })

  it('qualquer outra língua do navegador vira en', () => {
    expect(detectLang({ query: null, saved: null, browser: 'es-ES' })).toBe('en')
  })
})

describe('isLang', () => {
  it('aceita só pt e en', () => {
    expect(isLang('pt')).toBe(true)
    expect(isLang('en')).toBe(true)
    expect(isLang('PT')).toBe(false)
    expect(isLang(null)).toBe(false)
  })
})

describe('loc', () => {
  it('escolhe a versão do idioma', () => {
    const v: Localized = { pt: 'sobre', en: 'about' }
    expect(loc(v, 'pt')).toBe('sobre')
    expect(loc(v, 'en')).toBe('about')
  })

  it('funciona com listas', () => {
    const v: Localized<string[]> = { pt: ['a', 'b'], en: ['c'] }
    expect(loc(v, 'en')).toEqual(['c'])
  })

  it('texto sem tradução passa direto', () => {
    expect(loc('Java 17', 'en')).toBe('Java 17')
  })
})

describe('tr', () => {
  it('devolve o texto do idioma', () => {
    expect(tr('pt', 'Fechar', 'Close')).toBe('Fechar')
    expect(tr('en', 'Fechar', 'Close')).toBe('Close')
  })
})

// Teste de tipo: o `tsc -b` do build falha se a linha abaixo deixar de dar erro.
// @ts-expect-error falta o `en`
export const missingEn: Localized = { pt: 'só português' }
