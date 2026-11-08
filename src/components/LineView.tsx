import type { Line, SpanKind } from '../core/buffer'
import Cmd from './Cmd'

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

/** Desenha os trechos de uma linha: texto, link ou comando. Usado no <Doc> e no terminal. */
function LineView({ line }: { line: Line }) {
  return (
    <>
      {line.map((span, i) => {
        if (span.run) {
          return (
            <Cmd key={i} run={span.run}>
              {span.text}
            </Cmd>
          )
        }

        const className = KIND_CLASS[span.kind ?? 'plain'] || undefined
        if (!span.href) {
          return (
            <span key={i} className={className}>
              {span.text}
            </span>
          )
        }

        const external = !span.href.startsWith('#')
        return (
          <a
            key={i}
            href={span.href}
            className={className}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {span.text}
          </a>
        )
      })}
    </>
  )
}

export default LineView
