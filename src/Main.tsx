import { useState } from 'react'
import Editor from './components/Editor'
import FileTree from './components/FileTree'
import StatusBar from './components/StatusBar'
import Tabs, { type TabItem } from './components/Tabs'
import Terminal from './components/Terminal'
import { closeTab, openTab } from './core/tabs'
import { findNode } from './core/tree'
import { mockFrame, mockTree } from './data/mock'

/** Linhas falsas só para testar a rolagem do editor (some no F4). */
const FAKE_LINES = 80

function Main() {
  const [tabs, setTabs] = useState<string[]>(['perfil'])
  const [current, setCurrent] = useState('perfil')

  function open(id: string) {
    setTabs((t) => openTab(t, id))
    setCurrent(id)
  }

  function close(id: string) {
    const next = closeTab(tabs, id, current)
    setTabs(next.tabs)
    setCurrent(next.current)
  }

  const tabItems: TabItem[] = tabs.flatMap((id) => {
    const node = findNode(mockTree, id)
    return node ? [{ id: node.id, name: node.name, icon: node.icon }] : []
  })

  const currentName = findNode(mockTree, current)?.name ?? current

  return (
    <div className="frame">
      <header className="flex min-h-9 items-stretch gap-1 border-b border-line bg-panel pr-2 shadow-[inset_4px_0_0_var(--color-accent)] [grid-area:tabs]">
        <span className="hidden self-center pr-1.5 pl-4 text-accent md:inline" aria-hidden="true">
          ▸
        </span>
        <Tabs tabs={tabItems} active={current} onSelect={setCurrent} onClose={close} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-bg py-0.75 pr-1.5 pl-2.5 text-muted hover:border-accent hover:text-fg"
          >
            <span aria-hidden="true">⌕</span>
            <span className="hidden md:inline">{mockFrame.search}</span>
            <kbd className="hidden md:inline">Ctrl K</kbd>
          </button>
        </div>
      </header>

      <aside className="hidden min-h-0 flex-col overflow-auto border-r border-line bg-panel-2 [grid-area:side] md:flex">
        <div className="px-3.5 pt-3 pb-1.5 text-[0.82em] tracking-[0.08em] text-muted uppercase">{mockFrame.root}</div>
        <nav>
          <FileTree nodes={mockTree} active={current} onOpen={open} />
        </nav>
        <div className="mt-auto border-t border-line px-4 py-3.5 text-[0.85em] text-accent">{mockFrame.hire}</div>
      </aside>

      <Editor>
        <h1 className="mb-4 text-accent"># {currentName}</h1>
        {Array.from({ length: FAKE_LINES }, (_, i) => (
          <p key={i}>linha {i + 1}</p>
        ))}
      </Editor>

      <Terminal title={mockFrame.terminal} prompt={mockFrame.prompt} />

      <StatusBar
        mode={mockFrame.mode}
        branch={mockFrame.branch}
        path={`${mockFrame.root}/${currentName}`}
        lines={FAKE_LINES}
      />
    </div>
  )
}

export default Main
