import { describe, expect, it } from 'vitest'
import { fuzzyScore, rank } from './score'

const score = (q: string, t: string) => fuzzyScore(q, t)?.score ?? -Infinity

describe('fuzzyScore', () => {
  it('acha letras na ordem, mesmo separadas', () => {
    expect(fuzzyScore('cdt', 'Cdatra')?.positions).toEqual([0, 1, 3])
  })

  it('fora de ordem ou faltando letra não acha', () => {
    expect(fuzzyScore('tdc', 'Cdatra')).toBeNull()
    expect(fuzzyScore('cdx', 'Cdatra')).toBeNull()
  })

  it('ignora acento e maiúscula', () => {
    expect(fuzzyScore('CURRICULO', 'Currículo')).not.toBeNull()
    expect(fuzzyScore('currículo', 'curriculo.txt')).not.toBeNull()
  })

  it('busca vazia (ou só espaços) bate com tudo, sem pontos', () => {
    expect(fuzzyScore('  ', 'qualquer')).toEqual({ score: 0, positions: [] })
  })

  it('espaços na busca são ignorados', () => {
    expect(fuzzyScore('easy hub', 'EasyHub.jsx')).not.toBeNull()
  })

  it('prefixo vale mais que o meio', () => {
    expect(score('sob', 'sobre.md')).toBeGreaterThan(score('sob', 'xxsobre.md'))
  })

  it('começo de palavra vale mais que letra no meio da palavra', () => {
    expect(score('hub', 'Easy Hub')).toBeGreaterThan(score('hub', 'xhubx'))
  })

  it('camelCase conta como começo de palavra', () => {
    expect(fuzzyScore('eh', 'EasyHub')?.positions).toEqual([0, 4])
  })

  it('letras juntas valem mais que espalhadas', () => {
    expect(score('stack', 'stack.toml')).toBeGreaterThan(score('stack', 's-t-a-c-k'))
  })

  it('escolhe o melhor começo, não o primeiro', () => {
    // O primeiro "p" está no meio de "Sopa"; o melhor é o "P" de "Projetos".
    expect(fuzzyScore('proj', 'Sopa Projetos')?.positions).toEqual([5, 6, 7, 8])
  })

  it('texto idêntico ganha bônus grande', () => {
    expect(score('ls', 'ls')).toBeGreaterThan(score('ls', 'lsof') + 40)
  })
})

describe('rank', () => {
  const items = [
    { label: 'Sobre', detail: 'sobre.md' },
    { label: 'Cdatra', detail: 'projetos/Cdatra.java', keywords: 'java jdbc orm' },
    { label: 'Currículo', detail: 'curriculo.txt', keywords: 'cv resume pdf' },
    { label: 'Stack', detail: 'stack.toml', keywords: 'java react' },
  ]

  it('sem busca devolve tudo na ordem original', () => {
    expect(rank('', items).map((r) => r.item.label)).toEqual(['Sobre', 'Cdatra', 'Currículo', 'Stack'])
  })

  it('ordena pela pontuação', () => {
    expect(rank('cdt', items)[0].item.label).toBe('Cdatra')
    expect(rank('cur', items)[0].item.label).toBe('Currículo')
  })

  it('acha pelas palavras escondidas, mas sem destacar o rótulo', () => {
    const r = rank('resume', items)
    expect(r.map((x) => x.item.label)).toEqual(['Currículo'])
    expect(r[0].positions).toEqual([])
  })

  it('o rótulo vale mais que as palavras escondidas', () => {
    expect(rank('stack', items)[0].item.label).toBe('Stack')
  })

  it('tira quem não bate e respeita o limite', () => {
    expect(rank('zzz', items)).toEqual([])
    expect(rank('', items, 2)).toHaveLength(2)
  })
})
