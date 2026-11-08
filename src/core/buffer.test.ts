import { describe, expect, it } from 'vitest'
import { BLANK, a, line, lineText, s } from './buffer'

describe('line', () => {
  it('string solta vira trecho sem cor', () => {
    expect(line('olá')).toEqual([{ text: 'olá' }])
  })

  it('mistura strings, trechos com cor e links', () => {
    expect(line('repo: ', a('Cdatra', 'https://github.com/LordCarvel/Cdatra'), s(' ★', 'warm'))).toEqual([
      { text: 'repo: ' },
      { text: 'Cdatra', href: 'https://github.com/LordCarvel/Cdatra' },
      { text: ' ★', kind: 'warm' },
    ])
  })
})

describe('lineText', () => {
  it('junta o texto dos trechos', () => {
    expect(lineText(line(s('name', 'key'), ' = ', s('"Carvel"', 'str')))).toBe('name = "Carvel"')
  })

  it('linha em branco vira string vazia', () => {
    expect(lineText(BLANK)).toBe('')
  })
})
