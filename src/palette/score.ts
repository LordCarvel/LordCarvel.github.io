// Busca por subsequência, como o Ctrl+P de editor: "cdt" acha "Cdatra".
// As letras da busca precisam aparecer na ordem, não necessariamente juntas.
// TS puro: o componente da caixa só chama rank().

export type Match = {
  score: number
  /** Índices das letras encontradas no texto, para destacar na tela. */
  positions: number[]
}

/** Letra sem acento e minúscula, mantendo o índice (í → i). */
function fold(ch: string): string {
  return ch.normalize('NFD')[0].toLowerCase()
}

/** Começo de palavra: início do texto, depois de separador ou letra maiúscula no meio (camelCase). */
function isWordStart(text: string, i: number): boolean {
  if (i === 0) return true
  const prev = text[i - 1]
  if (/[\s/\\\-_.·:]/.test(prev)) return true
  return prev === prev.toLowerCase() && text[i] !== text[i].toLowerCase()
}

const BONUS_WORD_START = 8
const BONUS_CONSECUTIVE = 5
const BONUS_PREFIX = 10
const BONUS_EXACT = 50

/** Pontua uma tentativa que começa em `start`. Guloso: pega a próxima letra que bater. */
function scoreFrom(q: string[], text: string, folded: string[], start: number): Match | null {
  const positions: number[] = [start]
  let i = start + 1
  for (let k = 1; k < q.length; k++) {
    while (i < folded.length && folded[i] !== q[k]) i++
    if (i >= folded.length) return null
    positions.push(i++)
  }

  let score = 0
  positions.forEach((pos, k) => {
    score += 1
    if (isWordStart(text, pos)) score += BONUS_WORD_START
    if (k > 0 && pos === positions[k - 1] + 1) score += BONUS_CONSECUTIVE
    else if (k > 0) score -= Math.min(pos - positions[k - 1] - 1, 3) // buraco custa, até 3
  })
  score -= Math.min(start, 5) * 0.5 // começar mais para o fim custa um pouco
  if (positions[0] === 0 && positions.every((p, k) => p === k)) score += BONUS_PREFIX
  if (positions.length === text.length) score += BONUS_EXACT
  return { score, positions }
}

/** Pontua `text` para a busca `query`. null quando as letras não aparecem na ordem. */
export function fuzzyScore(query: string, text: string): Match | null {
  const q = [...query.replace(/\s+/g, '')].map(fold)
  if (q.length === 0) return { score: 0, positions: [] }
  const folded = [...text].map(fold)

  // Tenta começar em cada ocorrência da primeira letra e fica com a melhor.
  let best: Match | null = null
  for (let start = folded.indexOf(q[0]); start >= 0; start = folded.indexOf(q[0], start + 1)) {
    const m = scoreFrom(q, text, folded, start)
    if (m && (!best || m.score > best.score)) best = m
  }
  return best
}

export type Searchable = {
  /** Texto principal, que aparece destacado. */
  label: string
  /** Texto secundário (caminho, resumo). Vale um pouco menos. */
  detail?: string
  /** Palavras escondidas que também acham o item. Valem menos ainda. */
  keywords?: string
}

export type Ranked<T> = { item: T; score: number; positions: number[] }

/**
 * Ordena os itens pela busca. Sem busca, devolve todos na ordem original.
 * Empate mantém a ordem original (o sort do JS é estável).
 */
export function rank<T extends Searchable>(query: string, items: readonly T[], limit = 50): Ranked<T>[] {
  if (!query.trim()) return items.slice(0, limit).map((item) => ({ item, score: 0, positions: [] }))

  const ranked: Ranked<T>[] = []
  for (const item of items) {
    const onLabel = fuzzyScore(query, item.label)
    const others = [
      item.detail ? fuzzyScore(query, item.detail) : null,
      item.keywords ? fuzzyScore(query, item.keywords) : null,
    ]
    const otherScore = Math.max(
      others[0] ? others[0].score * 0.8 : -Infinity,
      others[1] ? others[1].score * 0.6 : -Infinity,
    )

    if (onLabel && onLabel.score >= otherScore) ranked.push({ item, score: onLabel.score, positions: onLabel.positions })
    else if (otherScore > -Infinity) ranked.push({ item, score: otherScore, positions: [] })
  }
  return ranked.sort((a, b) => b.score - a.score).slice(0, limit)
}
