import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { navigate } from '../hooks/useHashRoute'
import { useEditor } from '../hooks/useEditor'
import { useLang } from '../i18n/useLang'
import { runLine } from '../terminal/commands'
import { emptySession, record } from '../terminal/session'
import { TerminalContext } from './terminalContext'

/**
 * Guarda a sessão do terminal e expõe runCommand para o site inteiro:
 * o <Cmd> de qualquer página roda comandos aqui, como se a pessoa tivesse digitado.
 */
function TerminalProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang()
  const { registry } = useEditor()
  const [session, setSession] = useState(emptySession)

  const runCommand = useCallback(
    (input: string) => {
      // O comando roda aqui, fora do setSession: ele pode ter efeitos (abrir página,
      // trocar idioma), e o React pode chamar a função do setState duas vezes no StrictMode.
      const result = runLine(input, { lang, registry, open: navigate, setLang, cmdHistory: session.cmdHistory })
      setSession((s) => record(s, input, result.lines, { clear: result.clear }))
    },
    [lang, registry, setLang, session.cmdHistory],
  )

  const cancel = useCallback((input: string) => {
    setSession((s) => record(s, `${input}^C`, [], { remember: false }))
  }, [])

  const clear = useCallback(() => {
    setSession((s) => record(s, '', [], { clear: true, remember: false }))
  }, [])

  const value = useMemo(() => ({ session, runCommand, cancel, clear }), [session, runCommand, cancel, clear])

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
}

export default TerminalProvider
