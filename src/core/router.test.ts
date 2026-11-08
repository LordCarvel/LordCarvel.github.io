import { describe, expect, it } from 'vitest'
import { parseHash, resolveRoute, toHash } from './router'

describe('parseHash', () => {
  it('lê o id depois de #/', () => {
    expect(parseHash('#/sobre')).toBe('sobre')
  })

  it('aceita sem a barra e com barra no fim', () => {
    expect(parseHash('#sobre')).toBe('sobre')
    expect(parseHash('#/projetos/')).toBe('projetos')
  })

  it('hash vazio é a página inicial', () => {
    expect(parseHash('')).toBeNull()
    expect(parseHash('#')).toBeNull()
    expect(parseHash('#/')).toBeNull()
  })

  it('decodifica caracteres especiais', () => {
    expect(parseHash('#/caf%C3%A9')).toBe('café')
  })

  it('não quebra com % inválido', () => {
    expect(parseHash('#/100%')).toBe('100%')
  })
})

describe('toHash', () => {
  it('monta o hash e faz o caminho de volta', () => {
    expect(toHash('sobre')).toBe('#/sobre')
    expect(parseHash(toHash('café'))).toBe('café')
  })
})

describe('resolveRoute', () => {
  const exists = (id: string) => ['perfil', 'sobre'].includes(id)

  it('usa o id do hash quando ele existe', () => {
    expect(resolveRoute('#/sobre', exists, 'perfil')).toBe('sobre')
  })

  it('cai na página padrão com hash vazio ou desconhecido', () => {
    expect(resolveRoute('', exists, 'perfil')).toBe('perfil')
    expect(resolveRoute('#/xyz', exists, 'perfil')).toBe('perfil')
  })
})
