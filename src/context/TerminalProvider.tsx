import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { line, s } from '../core/buffer'
import { navigate } from '../hooks/useHashRoute'
import { useEditor } from '../hooks/useEditor'
import { useLang } from '../i18n/useLang'
import { useTheme } from '../hooks/useTheme'
import { commandNames, runLine } from '../terminal/commands'
import { complete as completeLine } from '../terminal/complete'
import { buildFs, findDir, pathOf, type FsNode } from '../terminal/fs'
import { emptySession, record } from '../terminal/session'
import { TerminalContext } from './terminalContext'

/**
 * Guarda a sessão do terminal e expõe runCommand para o site inteiro:
 * o <Cmd> de qualquer página roda comandos aqui, como se a pessoa tivesse digitado.
 */
function TerminalProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang()
  const { registry } = useEditor()
  const { theme, setTheme } = useTheme()
  const [session, setSession] = useState(emptySession)

  // O FS sai do registro; os nomes mudam com o idioma, a estrutura não.
  const fs = useMemo(() => buildFs(registry.all()), [registry])
  // Guardo o id da pasta, não o nó: se o FS for remontado, o id continua valendo.
  const [cwdId, setCwdId] = useState<string | null>(null)
  const cwd = findDir(fs, cwdId)

  const setCwd = useCallback((dir: FsNode) => setCwdId(dir.buffer?.id ?? null), [])

  const runCommand = useCallback(
    (input: string) => {
      // O comando roda aqui, fora do setSession: ele pode ter efeitos (abrir página,
      // trocar idioma, mudar de pasta), e o React pode chamar a função do setState
      // duas vezes no StrictMode.
      const prompt = `${pathOf(cwd, lang)} $`
      const result = runLine(input, {
        lang,
        registry,
        fs,
        cwd,
        setCwd,
        open: navigate,
        setLang,
        theme,
        setTheme,
        cmdHistory: session.cmdHistory,
        stdin: null,
      })
      setSession((s) => record(s, input, result.lines, { clear: result.clear, prompt }))
    },
    [lang, registry, fs, cwd, setCwd, setLang, theme, setTheme, session.cmdHistory],
  )

  const cancel = useCallback(
    (input: string) => {
      setSession((s) => record(s, `${input}^C`, [], { remember: false, prompt: `${pathOf(cwd, lang)} $` }))
    },
    [cwd, lang],
  )

  const clear = useCallback(() => {
    setSession((s) => record(s, '', [], { clear: true, remember: false }))
  }, [])

  const complete = useCallback(
    (input: string) => {
      const result = completeLine(input, { fs, cwd, lang, commandNames: commandNames() })
      if (result.options.length > 1) {
        // Como no bash: mostra as opções e mantém o que foi digitado.
        const lines = [line(...result.options.flatMap((o, i) => (i > 0 ? [s('  '), s(o, 'muted')] : [s(o, 'muted')])))]
        setSession((s) => record(s, input, lines, { remember: false, prompt: `${pathOf(cwd, lang)} $` }))
      }
      return result
    },
    [fs, cwd, lang],
  )

  const value = useMemo(
    () => ({ session, cwdPath: pathOf(cwd, lang), runCommand, cancel, clear, complete }),
    [session, cwd, lang, runCommand, cancel, clear, complete],
  )

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
}

export default TerminalProvider
