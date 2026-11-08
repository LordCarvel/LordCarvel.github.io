import { useEffect, useMemo, useState } from 'react'
import Doc from './components/Doc'
import Editor from './components/Editor'
import FileTree from './components/FileTree'
import Palette from './components/Palette'
import ThemePicker from './components/ThemePicker'
import StatusBar from './components/StatusBar'
import Tabs, { type TabItem } from './components/Tabs'
import Terminal from './components/Terminal'
import { isPaletteKey, isTypingTarget, matchShortcut } from './core/shortcuts'
import { buildTree, iconFor } from './core/tree'
import { frame } from './data/frame'
import { shortcuts } from './data/home'
import { themeText } from './data/themes'
import { useEditor } from './hooks/useEditor'
import { useShortcutKeys } from './hooks/useShortcutKeys'
import { useTerminal } from './hooks/useTerminal'
import { useTheme } from './hooks/useTheme'
import { useLang } from './i18n/useLang'
import { THEMES } from './themes'

function Main() {
  const { lang, setLang, loc } = useLang()
  const { registry, buffer, tabs, close } = useEditor()
  useShortcutKeys(shortcuts)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const { shown } = useTheme()
  const { runCommand } = useTerminal()
  const shownTheme = THEMES.find((t) => t.id === shown)

  // Teclas soltas, fora de campo de texto: T abre os temas, ? lista os comandos.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const hit = matchShortcut(
        { key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, typing: isTypingTarget(document.activeElement) },
        [
          { key: 't', target: 'theme' },
          { key: 'T', target: 'theme' },
          { key: '?', target: 'help' },
        ],
      )
      if (!hit) return
      e.preventDefault()
      if (hit === 'theme') setThemeOpen(true)
      else runCommand('help')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [runCommand])

  // Ctrl+K / Cmd+K abre e fecha a busca, de qualquer lugar.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isPaletteKey(e)) return
      e.preventDefault() // no Chrome, Ctrl+K iria para a barra de busca do navegador
      setPaletteOpen((open) => !open)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // A árvore só muda se o registro mudar: useMemo evita remontar a cada render.
  const tree = useMemo(() => buildTree(registry.all()), [registry])

  const tabItems: TabItem[] = tabs.flatMap((id) => {
    const b = registry.get(id)
    return b ? [{ id: b.id, name: loc(b.name), icon: iconFor(b.name.pt) }] : []
  })

  const fileName = loc(buffer.name)
  const path = buffer.dir ? `${frame.root}/${loc(registry.get(buffer.dir)!.name)}${fileName}` : `${frame.root}/${fileName}`
  const lines = buffer.lines(lang)

  useEffect(() => {
    document.title = `${fileName} · Carvel`
  }, [fileName])

  return (
    <div className="frame">
      <header className="flex min-h-9 items-stretch gap-1 border-b border-line bg-panel pr-2 shadow-[inset_4px_0_0_var(--color-accent)] [grid-area:tabs]">
        <span className="hidden self-center pr-1.5 pl-4 text-accent md:inline" aria-hidden="true">
          ▸
        </span>
        <Tabs
          tabs={tabItems}
          active={buffer.id}
          onClose={close}
          label={loc(frame.tabsAria)}
          closeLabel={loc(frame.close)}
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={loc(frame.searchAria)}
            aria-haspopup="dialog"
            onClick={() => setPaletteOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-bg py-0.75 pr-1.5 pl-2.5 text-muted hover:border-accent hover:text-fg"
          >
            <span aria-hidden="true">⌕</span>
            <span className="hidden md:inline">{loc(frame.search)}</span>
            <kbd className="hidden md:inline">Ctrl K</kbd>
          </button>
          <button
            type="button"
            aria-label={loc(frame.langAria)}
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            className="cursor-pointer rounded-md border border-transparent px-2.25 py-0.5 text-[0.85em] tracking-[0.04em] text-muted hover:border-line hover:text-fg"
          >
            <span className={lang === 'pt' ? 'font-bold text-accent' : undefined}>PT</span>·
            <span className={lang === 'en' ? 'font-bold text-accent' : undefined}>EN</span>
          </button>
        </div>
      </header>

      <aside className="hidden min-h-0 flex-col overflow-auto border-r border-line bg-panel-2 [grid-area:side] md:flex">
        <div className="px-3.5 pt-3 pb-1.5 text-[0.82em] tracking-[0.08em] text-muted uppercase">{frame.root}</div>
        <nav aria-label={loc(frame.treeAria)}>
          <FileTree nodes={tree} active={buffer.id} />
        </nav>
        <div className="mt-auto border-t border-line px-4 py-3.5 text-[0.85em] text-accent">{loc(frame.hire)}</div>
      </aside>

      {/* key: trocar de página recria o editor e a rolagem volta ao topo */}
      <Editor key={buffer.id}>{buffer.Component ? <buffer.Component /> : <Doc lines={lines} />}</Editor>

      <Terminal title={frame.terminal} placeholder={loc(frame.termPh)} />

      <StatusBar
        mode={frame.mode}
        branch={frame.branch}
        path={path}
        lines={lines.length}
        themeName={shownTheme ? loc(shownTheme.name) : shown}
        themeLabel={loc(themeText.statusAria)}
        onThemeClick={() => setThemeOpen(true)}
      />

      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} />}
      {themeOpen && <ThemePicker onClose={() => setThemeOpen(false)} />}
    </div>
  )
}

export default Main
