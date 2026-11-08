import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { paletteText as T } from '../data/palette'
import { navigate } from '../hooks/useHashRoute'
import { useEditor } from '../hooks/useEditor'
import { useTerminal } from '../hooks/useTerminal'
import { useLang } from '../i18n/useLang'
import { rank, type Searchable } from '../palette/score'
import { commands } from '../terminal/commands'

type Item = Searchable & { key: string; kind: 'page' | 'command'; run: () => void }

/** Desenha o rótulo com as letras encontradas destacadas. */
function Highlighted({ text, positions }: { text: string; positions: number[] }) {
  if (positions.length === 0) return <>{text}</>
  const hit = new Set(positions)
  return (
    <>
      {[...text].map((ch, i) =>
        hit.has(i) ? (
          <b key={i} className="text-accent">
            {ch}
          </b>
        ) : (
          ch
        ),
      )}
    </>
  )
}

/**
 * Busca rápida (Ctrl+K). Usa o <dialog> nativo com showModal(): o navegador já cuida
 * de prender o foco dentro da caixa, do Esc e do fundo escurecido (::backdrop).
 * Só existe na tela enquanto está aberta, então a busca começa limpa a cada vez.
 */
function Palette({ onClose }: { onClose: () => void }) {
  const { loc } = useLang()
  const { registry } = useEditor()
  const { runCommand } = useTerminal()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  // Abre como modal ao montar; ao fechar, devolve o foco para onde estava.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
    return () => previous?.focus()
  }, [])

  const items = useMemo<Item[]>(() => {
    const pages: Item[] = registry.all().map((b) => {
      const dir = b.dir ? registry.get(b.dir) : undefined
      return {
        key: `page:${b.id}`,
        kind: 'page',
        label: loc(b.title),
        detail: dir ? `${loc(dir.name)}${loc(b.name)}` : loc(b.name),
        // As duas línguas: quem busca "about" com o site em português também acha.
        keywords: [b.keywords, b.title.pt, b.title.en, b.name.pt, b.name.en].filter(Boolean).join(' '),
        run: () => navigate(b.id),
      }
    })

    // Comandos que funcionam sem argumento (o usage não tem <obrigatório>).
    // Os de portfolio ficam de fora porque as páginas já aparecem acima.
    const cmds: Item[] = commands
      .filter((c) => c.group !== 'portfolio' && !c.usage.includes('<'))
      .map((c) => ({
        key: `cmd:${c.names.en}`,
        kind: 'command',
        label: loc(c.names),
        detail: loc(c.summary),
        keywords: [c.names.pt, c.names.en, ...(c.aliases ?? [])].join(' '),
        run: () => runCommand(loc(c.names)),
      }))

    return [...pages, ...cmds]
  }, [registry, loc, runCommand]) // `loc` muda junto com o idioma

  const results = rank(query, items, 30)
  const active = Math.min(selected, Math.max(0, results.length - 1))

  // A opção escolhida com as setas sempre aparece na lista.
  useEffect(() => {
    document.getElementById(`palette-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function choose(item: Item | undefined) {
    if (!item) return
    onClose()
    item.run()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setSelected((active + step + results.length) % Math.max(1, results.length)) // dá a volta
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[active]?.item)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={loc(T.aria)}
      onClose={onClose}
      // Clique no fundo (fora da caixa) fecha: o alvo é o próprio <dialog>.
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      className="mx-auto mt-[12vh] w-[min(620px,calc(100%-32px))] max-w-none overflow-hidden rounded-xl border border-line bg-panel-2 p-0 text-fg shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="text-accent" aria-hidden="true">
          :
        </span>
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results.length ? `palette-opt-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={loc(T.placeholder)}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[1.05em] outline-none placeholder:text-muted/60"
        />
        <kbd>Esc</kbd>
      </div>

      <ul id="palette-list" role="listbox" aria-label={loc(T.results)} className="max-h-[50vh] overflow-auto p-1.5">
        {results.length === 0 && <li className="px-2.5 py-2 text-muted">{loc(T.empty)}</li>}
        {results.map(({ item, positions }, i) => (
          <li
            key={item.key}
            id={`palette-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseMove={() => i !== active && setSelected(i)}
            onClick={() => choose(item)}
            className={`grid cursor-pointer grid-cols-1 items-center gap-x-3 rounded-md px-2.5 py-2 md:grid-cols-[minmax(8ch,auto)_1fr_auto] ${
              i === active ? 'bg-hl shadow-[inset_2px_0_0_var(--color-accent)]' : ''
            }`}
          >
            <span>
              <Highlighted text={item.label} positions={positions} />
            </span>
            <span className="truncate text-[0.85em] text-muted">{item.detail}</span>
            <span className="hidden text-[0.75em] tracking-[0.06em] text-warm uppercase md:inline">
              {loc(item.kind === 'page' ? T.page : T.command)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-4 py-1.5 text-[0.8em] text-muted">
        {loc(T.hint)}
      </div>
    </dialog>
  )
}

export default Palette
