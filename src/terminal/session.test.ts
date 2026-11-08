import { describe, expect, it } from 'vitest'
import { line } from '../core/buffer'
import { MAX_ENTRIES, emptySession, record } from './session'

describe('record', () => {
  it('adiciona a entrada e o comando ao histórico', () => {
    const s = record(emptySession, 'echo oi', [line('oi')])
    expect(s.entries).toEqual([{ id: 1, prompt: '~ $', input: 'echo oi', lines: [line('oi')] }])
    expect(s.cmdHistory).toEqual(['echo oi'])
  })

  it('guarda o prompt da hora do comando', () => {
    expect(record(emptySession, 'ls', [], { prompt: '~/projetos $' }).entries[0].prompt).toBe('~/projetos $')
  })

  it('ids crescem a cada entrada', () => {
    const s = record(record(emptySession, 'a', []), 'b', [])
    expect(s.entries.map((e) => e.id)).toEqual([1, 2])
  })

  it('clear apaga a saída, mas o comando fica no histórico', () => {
    const s = record(record(emptySession, 'help', [line('...')]), 'clear', [], { clear: true })
    expect(s.entries).toEqual([])
    expect(s.cleared).toBe(true)
    expect(s.cmdHistory).toEqual(['help', 'clear'])
  })

  it('remember: false não guarda no histórico', () => {
    const s = record(emptySession, 'abc^C', [], { remember: false })
    expect(s.entries).toHaveLength(1)
    expect(s.cmdHistory).toEqual([])
  })

  it('guarda no máximo MAX_ENTRIES entradas', () => {
    let s = emptySession
    for (let i = 0; i < MAX_ENTRIES + 5; i++) s = record(s, `echo ${i}`, [])
    expect(s.entries).toHaveLength(MAX_ENTRIES)
    expect(s.entries[0].input).toBe('echo 5')
  })

  it('não altera a sessão recebida', () => {
    record(emptySession, 'help', [])
    expect(emptySession.entries).toEqual([])
  })
})
