type Props = { title: string; prompt: string; placeholder: string }

// Só a casca por enquanto: entrada, histórico e comandos chegam no F7.
function Terminal({ title, prompt, placeholder }: Props) {
  return (
    <section aria-label="Terminal" className="flex flex-col border-t border-line bg-panel-2 text-[0.9em] [grid-area:term]">
      <div className="flex items-center gap-3 border-b border-line py-0.75 pr-2 pl-4 text-[0.85em]">
        <span className="text-muted">{title}</span>
      </div>
      <div className="max-h-[clamp(90px,22vh,220px)] min-h-12 overflow-auto px-4 pt-2">{/* saída */}</div>
      <div className="flex items-center gap-2.5 px-4 py-1.5">
        <label htmlFor="term-input" className="whitespace-nowrap text-accent">
          {prompt}
        </label>
        <input
          id="term-input"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-0.5 caret-accent outline-none placeholder:text-muted/60"
        />
      </div>
    </section>
  )
}

export default Terminal
