import type { Line } from '../core/buffer'
import { addToHistory } from './history'

/** Um bloco da saída: o que foi digitado e o que o comando respondeu. */
export type Entry = { id: number; input: string; lines: Line[] }

export type Session = {
  entries: Entry[]
  cmdHistory: string[]
  /** Depois de um clear, a mensagem de boas-vindas não volta. */
  cleared: boolean
  nextId: number
}

export const MAX_ENTRIES = 200

export const emptySession: Session = { entries: [], cmdHistory: [], cleared: false, nextId: 1 }

export type RecordOptions = {
  /** O comando pediu para limpar a tela. */
  clear?: boolean
  /** false para o que não deve ir ao histórico (ex.: Ctrl+C). */
  remember?: boolean
}

/** Registra um comando executado. Função pura: devolve uma sessão nova. */
export function record(session: Session, input: string, lines: Line[], options: RecordOptions = {}): Session {
  const { clear = false, remember = true } = options
  const cmdHistory = remember ? addToHistory(session.cmdHistory, input) : session.cmdHistory

  if (clear) return { ...session, entries: [], cmdHistory, cleared: true }

  const entries = [...session.entries, { id: session.nextId, input, lines }].slice(-MAX_ENTRIES)
  return { ...session, entries, cmdHistory, nextId: session.nextId + 1 }
}
