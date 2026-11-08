import { describe, expect, it } from 'vitest'
import { dailyCounts, parsePushes, parseRepos, relTime, sparkline, type Push } from './github'

describe('parseRepos', () => {
  const raw = [
    { name: 'Antigo', html_url: 'https://github.com/x/Antigo', language: 'Java', pushed_at: '2026-01-01T00:00:00Z', fork: false },
    { name: 'Fork', html_url: 'u', language: null, pushed_at: '2026-11-01T00:00:00Z', fork: true },
    { name: 'Novo', html_url: 'https://github.com/x/Novo', language: null, pushed_at: '2026-11-05T00:00:00Z', fork: false },
  ]

  it('tira os forks e ordena pelo push mais recente', () => {
    expect(parseRepos(raw).map((r) => r.name)).toEqual(['Novo', 'Antigo'])
  })

  it('converte para os nossos nomes de campo', () => {
    expect(parseRepos(raw)[1]).toEqual({
      name: 'Antigo',
      url: 'https://github.com/x/Antigo',
      language: 'Java',
      pushedAt: '2026-01-01T00:00:00Z',
    })
  })

  it('resposta inesperada vira lista vazia', () => {
    expect(parseRepos({ message: 'API rate limit exceeded' })).toEqual([])
    expect(parseRepos([null, 42, { semNome: true }])).toEqual([])
  })
})

describe('parsePushes', () => {
  it('fica só com os pushes e simplifica repo e branch', () => {
    const raw = [
      { type: 'PushEvent', created_at: '2026-11-07T10:00:00Z', repo: { name: 'LordCarvel/Cdatra' }, payload: { ref: 'refs/heads/main' } },
      { type: 'ReleaseEvent', created_at: '2026-11-07T09:00:00Z', repo: { name: 'LordCarvel/Cdatra' }, payload: {} },
    ]
    expect(parsePushes(raw)).toEqual([{ repo: 'Cdatra', branch: 'main', at: '2026-11-07T10:00:00Z' }])
  })

  it('ordena do mais recente para o mais antigo', () => {
    const ev = (at: string) => ({ type: 'PushEvent', created_at: at, repo: { name: 'x/r' }, payload: { ref: 'refs/heads/main' } })
    const raw = [ev('2026-11-02T00:00:00Z'), ev('2026-11-04T00:00:00Z'), ev('2026-11-03T00:00:00Z')]
    expect(parsePushes(raw).map((p) => p.at.slice(8, 10))).toEqual(['04', '03', '02'])
  })

  it('resposta inesperada vira lista vazia', () => {
    expect(parsePushes('erro')).toEqual([])
  })
})

describe('dailyCounts', () => {
  // Datas no fuso local, para o teste passar em qualquer máquina.
  const now = new Date(2026, 10, 7, 15, 0).getTime()
  const push = (d: Date): Push => ({ repo: 'r', branch: 'main', at: d.toISOString() })

  it('o último item é hoje e o primeiro é 29 dias atrás', () => {
    const counts = dailyCounts([push(new Date(2026, 10, 7, 1)), push(new Date(2026, 9, 9, 12))], now)
    expect(counts).toHaveLength(30)
    expect(counts[29]).toBe(1)
    expect(counts[0]).toBe(1)
  })

  it('soma vários pushes no mesmo dia', () => {
    const counts = dailyCounts([push(new Date(2026, 10, 6, 8)), push(new Date(2026, 10, 6, 23))], now)
    expect(counts[28]).toBe(2)
  })

  it('ignora pushes fora da janela e no futuro', () => {
    const counts = dailyCounts([push(new Date(2026, 9, 1)), push(new Date(2026, 10, 9))], now)
    expect(counts.every((n) => n === 0)).toBe(true)
  })
})

describe('sparkline', () => {
  it('dia sem push é ·, o maior dia é █', () => {
    expect(sparkline([0, 4, 0])).toBe('·█·')
  })

  it('dias menores ficam proporcionalmente mais baixos', () => {
    expect(sparkline([1, 2, 4, 8])).toBe('▁▂▄█')
  })
})

describe('relTime', () => {
  const now = Date.parse('2026-11-07T12:00:00Z')

  it('em português e em inglês', () => {
    expect(relTime('2026-11-07T08:00:00Z', now, 'pt')).toBe('hoje')
    expect(relTime('2026-11-06T08:00:00Z', now, 'en')).toBe('yesterday')
    expect(relTime('2026-11-02T12:00:00Z', now, 'pt')).toBe('há 5 dias')
    expect(relTime('2026-09-01T12:00:00Z', now, 'en')).toBe('2 months ago')
    expect(relTime('2025-10-01T12:00:00Z', now, 'pt')).toBe('há 1 ano')
  })

  it('sem data devolve vazio', () => {
    expect(relTime(null, now, 'pt')).toBe('')
  })
})
