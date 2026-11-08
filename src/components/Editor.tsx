import type { ReactNode } from 'react'

function Editor({ children }: { children: ReactNode }) {
  return (
    <main id="editor" tabIndex={-1} className="min-h-0 overflow-auto scroll-smooth outline-none [grid-area:editor]">
      <div className="doc-root max-w-250 pt-4.5 pr-6 pb-8.5 pl-1.5">{children}</div>
    </main>
  )
}

export default Editor
