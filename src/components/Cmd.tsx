import type { ReactNode } from 'react'
import { useTerminal } from '../hooks/useTerminal'

type Props = {
  /** O comando, exatamente como seria digitado. */
  run: string
  children?: ReactNode
}

/** Botão que roda um comando no terminal (regra 1: nada exige digitar). */
function Cmd({ run, children }: Props) {
  const { runCommand } = useTerminal()

  return (
    <button
      type="button"
      onClick={() => runCommand(run)}
      className="inline cursor-pointer rounded-sm border border-accent/35 bg-accent/12 px-1 text-accent hover:bg-accent/25"
    >
      {children ?? run}
    </button>
  )
}

export default Cmd
