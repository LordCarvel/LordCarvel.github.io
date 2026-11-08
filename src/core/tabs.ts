/** Aba que nunca sai sozinha quando o limite de abas estoura. */
const PINNED = 'perfil'

/**
 * Abre `id` no fim da lista, sem duplicar.
 * Passando de `max`, fecha a aba mais antiga que não seja a fixa nem a recém-aberta.
 * Nunca altera o array recebido (o React compara por referência).
 */
export function openTab(tabs: readonly string[], id: string, max = 8): string[] {
  if (tabs.includes(id)) return [...tabs]

  const next = [...tabs, id]
  if (next.length <= max) return next

  const oldest = next.findIndex((t) => t !== PINNED && t !== id)
  return next.filter((_, i) => i !== oldest)
}

/**
 * Fecha `id`. Se ela era a atual, a atual passa a ser a vizinha da esquerda
 * (ou a nova primeira). A última aba aberta nunca fecha.
 */
export function closeTab(
  tabs: readonly string[],
  id: string,
  current: string,
): { tabs: string[]; current: string } {
  const i = tabs.indexOf(id)
  if (i < 0 || tabs.length === 1) return { tabs: [...tabs], current }

  const next = tabs.filter((t) => t !== id)
  return { tabs: next, current: id === current ? next[Math.max(0, i - 1)] : current }
}
