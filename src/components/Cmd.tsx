import type { ReactNode } from 'react'
import { useTerminal } from '../hooks/useTerminal'

type Props = {
  /** O comando, exatamente como seria digitado. */
  run: string
  /** Com className, vira texto colorido clicável (sem a moldura), como as pastas no ls. */
  className?: string
  children?: ReactNode
}

/** Botão que roda um comando no terminal (regra 1: nada exige digitar). */
function Cmd({ run, className, children }: Props) {
  const { runCommand } = useTerminal()

  return (
    <button
      type="button"
      onClick={() => runCommand(run)}
      className={
        className
          ? `inline cursor-pointer font-semibold hover:underline ${className}`
          : 'inline cursor-pointer rounded-sm border border-accent/35 bg-accent/12 px-1 text-accent hover:bg-accent/25'
      }
    >
      {children ?? run}
    </button>
  )
}

export default Cmd
