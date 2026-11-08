import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { themeText as T } from '../data/themes'
import { useTheme } from '../hooks/useTheme'
import { useLang } from '../i18n/useLang'
import { THEMES } from '../themes'

/** Cores que aparecem na amostra de cada tema. */
const SWATCH = ['bg-bg', 'bg-panel', 'bg-accent', 'bg-warm', 'bg-blue', 'bg-violet']

/**
 * Seletor de temas (tecla T). As setas e o mouse mostram o tema na hora (prévia),
 * Enter ou clique escolhe e salva, Esc volta para o que estava.
 */
function ThemePicker({ onClose }: { onClose: () => void }) {
  const { loc } = useLang()
  const { theme, shown, setTheme, preview } = useTheme()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState(() => Math.max(0, THEMES.findIndex((t) => t.id === shown)))

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
    return () => {
      preview(null) // fechou sem escolher: some a prévia
      previous?.focus()
    }
  }, [preview])

  function show(i: number) {
    setActive(i)
    preview(THEMES[i].id)
  }

  function choose(i: number) {
    setTheme(THEMES[i].id)
    dialogRef.current?.close()
  }

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      show((active + (e.key === 'ArrowDown' ? 1 : -1) + THEMES.length) % THEMES.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(active)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="theme-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      className="mx-auto mt-[12vh] w-[min(420px,calc(100%-32px))] max-w-none overflow-hidden rounded-xl border border-line bg-panel-2 p-0 text-fg shadow-2xl backdrop:bg-black/45"
    >
      <h2 id="theme-title" className="border-b border-line px-4 py-3 text-accent">
        {loc(T.title)}
      </h2>

      <ul
        role="listbox"
        aria-labelledby="theme-title"
        aria-activedescendant={`theme-opt-${active}`}
        tabIndex={0}
        autoFocus
        onKeyDown={onKeyDown}
        className="p-1.5 outline-none"
      >
        {THEMES.map((t, i) => (
          <li
            key={t.id}
            id={`theme-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => show(i)}
            onClick={() => choose(i)}
            className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 ${
              i === active ? 'bg-hl shadow-[inset_2px_0_0_var(--color-accent)]' : ''
            }`}
          >
            {/* data-theme na amostra: as cores vêm do próprio tema, sem copiar nada para o JS */}
            <span data-theme={t.id} className="flex overflow-hidden rounded-sm border border-line" aria-hidden="true">
              {SWATCH.map((c) => (
                <i key={c} className={`h-3.5 w-2.5 ${c}`} />
              ))}
            </span>
            <span className="flex-1">{loc(t.name)}</span>
            {t.id === theme && <span className="text-[0.8em] text-muted">{loc(T.current)}</span>}
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-4 py-1.5 text-[0.8em] text-muted">{loc(T.hint)}</div>
    </dialog>
  )
}

export default ThemePicker
