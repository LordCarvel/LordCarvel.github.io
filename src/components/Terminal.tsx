import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { line, s } from '../core/buffer'
import { isTypingTarget, matchShortcut } from '../core/shortcuts'
import { chips, terminalText } from '../data/terminal'
import { useTerminal } from '../hooks/useTerminal'
import { useLang } from '../i18n/useLang'
import { browseHistory } from '../terminal/history'
import Cmd from './Cmd'
import LineView from './LineView'

type Props = { title: string; placeholder: string }

/** Teclas que levam o foco ao terminal, de qualquer lugar da página. */
const FOCUS_KEYS = [
  { key: ':', target: 'terminal' },
  { key: '/', target: 'terminal' },
]

function Terminal({ title, placeholder }: Props) {
  const { loc } = useLang()
  const { session, cwdPath, runCommand, cancel, clear, complete } = useTerminal()
  const prompt = `${cwdPath} $`
  const [input, setInput] = useState('')
  const [cursor, setCursor] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Saída nova: rola até o fim. Efeito é o lugar certo para mexer no DOM depois de renderizar.
  useEffect(() => {
    const out = outputRef.current
    if (out) out.scrollTop = out.scrollHeight
  }, [session.entries])

  // ':' ou '/' em qualquer lugar foca o terminal.
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      const hit = matchShortcut(
        { key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, typing: isTypingTarget(document.activeElement) },
        FOCUS_KEYS,
      )
      if (!hit) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      runCommand(input)
      setInput('')
      setCursor(null)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault() // senão o cursor do texto pula para o começo/fim
      const next = browseHistory(session.cmdHistory, cursor, e.key === 'ArrowUp' ? 'up' : 'down')
      setCursor(next.cursor)
      setInput(next.value)
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault() // Ctrl+L focaria a barra de endereço
      clear()
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      // Só cancela se não houver texto selecionado: aí o Ctrl+C continua copiando.
      e.preventDefault()
      cancel(input)
      setInput('')
      setCursor(null)
    } else if (e.key === 'Tab' && input.trim() !== '') {
      // Só com algo digitado: com a linha vazia, o Tab segue movendo o foco (acessibilidade).
      e.preventDefault()
      setInput(complete(input).value)
      setCursor(null)
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const welcome = line(s(loc(terminalText.welcome), 'muted'))

  return (
    <section aria-label="Terminal" className="flex flex-col border-t border-line bg-panel-2 text-[0.9em] [grid-area:term]">
      <div className="flex items-center gap-3 border-b border-line py-0.75 pr-2 pl-4 text-[0.85em]">
        <span className="text-muted">{title}</span>
        <span className="ml-auto hidden text-muted md:inline">
          <kbd>:</kbd> <kbd>Tab</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>Ctrl L</kbd>
        </span>
      </div>

      <div
        ref={outputRef}
        aria-live="polite"
        className="max-h-[clamp(90px,22vh,220px)] min-h-12 overflow-auto px-4 pt-2 whitespace-pre-wrap [overflow-wrap:anywhere]"
      >
        {!session.cleared && (
          <div>
            <LineView line={welcome} />
          </div>
        )}
        {session.entries.map((entry) => (
          <div key={entry.id} className="py-px">
            <div>
              <span className="text-accent">{entry.prompt}</span> {entry.input}
            </div>
            {entry.lines.map((l, i) => (
              <div key={i}>
                <LineView line={l} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 px-4 py-1.5">
        <label htmlFor="term-input" className="whitespace-nowrap text-accent">
          {prompt}
        </label>
        <input
          ref={inputRef}
          id="term-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setCursor(null)
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-0.5 caret-accent outline-none placeholder:text-muted/60"
        />
      </div>

      <div
        aria-label={loc(terminalText.chipsAria)}
        className="flex gap-1.5 overflow-x-auto px-4 pb-2 whitespace-nowrap [scrollbar-width:none]"
      >
        {loc(chips).map((c) => (
          <Cmd key={c} run={c} />
        ))}
      </div>
    </section>
  )
}

export default Terminal
