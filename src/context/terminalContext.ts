import { createContext } from 'react'
import type { Completion } from '../terminal/complete'
import type { Session } from '../terminal/session'

export type TerminalContextValue = {
  session: Session
  /** Caminho da pasta atual, para o prompt: ~/projetos */
  cwdPath: string
  /** Executa como se a pessoa tivesse digitado e apertado Enter. */
  runCommand: (input: string) => void
  /** Ctrl+C: mostra a linha cancelada, sem executar nem guardar no histórico. */
  cancel: (input: string) => void
  /** Ctrl+L */
  clear: () => void
  /** Tab: completa a linha. Com várias opções, mostra a lista na saída. */
  complete: (input: string) => Completion
}

export const TerminalContext = createContext<TerminalContextValue | null>(null)
