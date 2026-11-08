import type { TreeNode } from '../core/tree'
import { useLang } from '../i18n/useLang'

type Props = {
  nodes: TreeNode[]
  active: string
  onOpen: (id: string) => void
  /** Uso interno da recursão: true quando a lista está dentro de uma pasta. */
  nested?: boolean
}

function FileTree({ nodes, active, onOpen, nested = false }: Props) {
  const { loc } = useLang()

  return (
    <ul className={nested ? 'ml-5.5 border-l border-dashed border-line pl-3.5' : undefined}>
      {nodes.map((node) => {
        const isActive = node.id === active
        const isDir = node.children !== undefined

        return (
          <li key={node.id}>
            <a
              href={`#/${node.id}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onOpen(node.id)}
              className={`flex items-center gap-2.5 py-0.75 whitespace-nowrap hover:bg-hl hover:no-underline ${
                nested ? 'pr-4 pl-2' : 'px-4'
              } ${isActive ? 'bg-hl text-accent shadow-[inset_2px_0_0_var(--color-accent)]' : 'text-fg'}`}
            >
              <span
                aria-hidden="true"
                className={`w-[1.2em] text-center text-[0.9em] ${isDir ? 'text-muted' : 'text-warm'}`}
              >
                {node.icon}
              </span>
              {loc(node.name)}
            </a>

            {node.children && <FileTree nodes={node.children} active={active} onOpen={onOpen} nested />}
          </li>
        )
      })}
    </ul>
  )
}

export default FileTree
