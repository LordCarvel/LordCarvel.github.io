import type { Line } from '../core/buffer'
import LineView from './LineView'

function Doc({ lines }: { lines: Line[] }) {
  return (
    <div className="doc">
      {lines.map((spans, i) => (
        // A lista de linhas nunca reordena, então o índice serve de key.
        <div key={i} className="ln">
          <span>
            <LineView line={spans} />
          </span>
        </div>
      ))}
    </div>
  )
}

export default Doc
