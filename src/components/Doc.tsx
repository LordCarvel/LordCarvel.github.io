import type { Line, SpanKind } from '../core/buffer'

// Classes inteiras escritas aqui: o Tailwind lê o código procurando nomes completos,
// então algo como `text-${cor}` nunca geraria o CSS.
const KIND_CLASS: Record<SpanKind, string> = {
  plain: '',
  title: 'font-extrabold text-accent',
  muted: 'text-muted',
  comment: 'text-muted italic',
  accent: 'text-accent',
  warm: 'text-warm',
  key: 'text-warm',
  str: 'text-accent',
  kw: 'text-violet',
  prop: 'text-blue',
}

function Doc({ lines }: { lines: Line[] }) {
  return (
    <div className="doc">
      {lines.map((spans, i) => (
        // A lista de linhas nunca reordena, então o índice serve de key.
        <div key={i} className="ln">
          <span>
            {spans.map((span, j) => {
              const className = KIND_CLASS[span.kind ?? 'plain'] || undefined
              if (!span.href) return <span key={j} className={className}>{span.text}</span>

              const external = !span.href.startsWith('#')
              return (
                <a
                  key={j}
                  href={span.href}
                  className={className}
                  {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {span.text}
                </a>
              )
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default Doc
