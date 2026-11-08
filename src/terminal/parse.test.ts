import { describe, expect, it } from 'vitest'
import { tokenize } from './parse'

describe('tokenize', () => {
  it('separa por espaços, ignorando sobras', () => {
    expect(tokenize('  ls   -la  projetos ')).toEqual(['ls', '-la', 'projetos'])
  })

  it('linha vazia não tem argumentos', () => {
    expect(tokenize('   ')).toEqual([])
  })

  it('aspas juntam um argumento com espaço', () => {
    expect(tokenize('echo "olá mundo" \'e você\'')).toEqual(['echo', 'olá mundo', 'e você'])
  })

  it('aspas no meio da palavra continuam a mesma palavra', () => {
    expect(tokenize('grep na"me x"y')).toEqual(['grep', 'name xy'])
  })

  it('aspas vazias viram argumento vazio', () => {
    expect(tokenize('echo ""')).toEqual(['echo', ''])
  })

  it('barra invertida escapa o próximo caractere', () => {
    expect(tokenize('echo a\\ b \\"c\\"')).toEqual(['echo', 'a b', '"c"'])
  })

  it('aspa sem fechar vai até o fim', () => {
    expect(tokenize('echo "sem fim')).toEqual(['echo', 'sem fim'])
  })
})
