import { describe, expect, it } from 'vitest'
import { parsePipeline, tokenize } from './parse'

describe('parsePipeline', () => {
  it('sem pipe é uma etapa só', () => {
    expect(parsePipeline('ls -la')).toEqual([['ls', '-la']])
  })

  it('separa as etapas no |', () => {
    expect(parsePipeline('grep java | head -3')).toEqual([
      ['grep', 'java'],
      ['head', '-3'],
    ])
  })

  it('| dentro de aspas ou escapado é texto', () => {
    expect(parsePipeline('grep "a|b" | wc')).toEqual([['grep', 'a|b'], ['wc']])
    expect(parsePipeline('echo a\\|b')).toEqual([['echo', 'a|b']])
  })

  it('etapas vazias somem', () => {
    expect(parsePipeline(' | ls ||')).toEqual([['ls']])
    expect(parsePipeline('')).toEqual([])
  })
})

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
