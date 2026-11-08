import { useContext } from 'react'
import { TerminalContext, type TerminalContextValue } from '../context/terminalContext'

export function useTerminal(): TerminalContextValue {
  const value = useContext(TerminalContext)
  if (!value) throw new Error('useTerminal() precisa estar dentro de <TerminalProvider>')
  return value
}
