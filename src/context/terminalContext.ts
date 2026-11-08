import { createContext } from 'react'
import type { Session } from '../terminal/session'

export type TerminalContextValue = {
  session: Session
  /** Executa como se a pessoa tivesse digitado e apertado Enter. */
  runCommand: (input: string) => void
  /** Ctrl+C: mostra a linha cancelada, sem executar nem guardar no histórico. */
  cancel: (input: string) => void
  /** Ctrl+L */
  clear: () => void
}

export const TerminalContext = createContext<TerminalContextValue | null>(null)
