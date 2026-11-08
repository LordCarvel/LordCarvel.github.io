type Props = {
  mode: string
  branch: string
  path: string
  lines: number
  /** Nome do tema na tela; clicar abre o seletor (regra 1: a tecla T também tem botão). */
  themeName: string
  themeLabel: string
  onThemeClick: () => void
}

function StatusBar({ mode, branch, path, lines, themeName, themeLabel, onThemeClick }: Props) {
  return (
    <footer className="flex min-h-6 items-stretch border-t border-line bg-panel text-[0.82em] text-muted [grid-area:status]">
      <span className="flex min-w-[9ch] items-center justify-center bg-accent px-4 py-0.75 font-extrabold text-accent-ink">
        {mode}
      </span>
      <span className="hidden items-center border-r border-line px-3 py-0.75 text-warm md:flex"> {branch}</span>
      <span className="flex min-w-0 items-center truncate px-3 py-0.75">{path}</span>
      <span className="ml-auto flex items-center gap-3.5 px-3.5 py-0.75 whitespace-nowrap">
        <button
          type="button"
          aria-label={themeLabel}
          onClick={onThemeClick}
          className="hidden cursor-pointer hover:text-accent md:inline"
        >
          ◐ {themeName}
        </button>
        <span className="hidden md:inline">utf-8</span>
        <span>{lines} L</span>
      </span>
    </footer>
  )
}

export default StatusBar
