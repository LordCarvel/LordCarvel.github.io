import { describe, expect, it } from 'vitest'
import { contrast, hexToRgb, luminance } from './contrast'

describe('hexToRgb', () => {
  it('lê 6 e 3 dígitos', () => {
    expect(hexToRgb('#a7d88b')).toEqual([167, 216, 139])
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
  })

  it('recusa o que não é cor', () => {
    expect(() => hexToRgb('red')).toThrow('cor inválida')
  })
})

describe('contrast', () => {
  it('preto e branco é 21, cor igual é 1', () => {
    expect(contrast('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrast('#777', '#777')).toBe(1)
  })

  it('a ordem não importa', () => {
    expect(contrast('#101610', '#e7e6df')).toBe(contrast('#e7e6df', '#101610'))
  })

  it('bate com valores conhecidos da WCAG', () => {
    // #767676 em branco é o cinza mais claro que passa no AA (4.54).
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
    expect(luminance('#ffffff')).toBe(1)
  })
})
