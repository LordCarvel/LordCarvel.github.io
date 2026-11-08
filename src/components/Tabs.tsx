export type TabItem = { id: string; name: string; icon: string }

type Props = {
  tabs: TabItem[]
  active: string
  onClose: (id: string) => void
  /** aria-label da lista e prefixo do botão de fechar ("Fechar perfil.md"). */
  label: string
  closeLabel: string
}

function Tabs({ tabs, active, onClose, label, closeLabel }: Props) {
  const closable = tabs.length > 1

  return (
    <ul aria-label={label} className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
      {tabs.map((tab) => {
        const isActive = tab.id === active

        return (
          <li
            key={tab.id}
            className={`group flex items-center border-r border-line whitespace-nowrap ${
              isActive ? 'bg-bg shadow-[inset_0_-2px_0_var(--color-accent)]' : ''
            }`}
          >
            <a
              href={`#/${tab.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 py-1.75 pr-1 pl-3 hover:text-fg hover:no-underline ${
                isActive ? 'text-fg' : 'text-muted'
              }`}
            >
              <span aria-hidden="true" className="text-[0.85em] text-warm">
                {tab.icon}
              </span>
              {tab.name}
            </a>

            {closable && (
              <button
                type="button"
                aria-label={`${closeLabel} ${tab.name}`}
                onClick={() => onClose(tab.id)}
                className={`cursor-pointer pr-2.5 pl-1.5 text-muted group-hover:opacity-100 hover:text-err ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                ×
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Tabs
