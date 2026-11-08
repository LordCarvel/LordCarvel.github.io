/** O que interessa de um evento de teclado para decidir um atalho. */
export type KeyInput = {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  /** true quando o foco está num input, textarea ou contenteditable. */
  typing: boolean
}

/**
 * Devolve o destino do atalho, ou null.
 * Nunca rouba tecla de quem está digitando nem de combinações (Ctrl+1 troca de aba no navegador).
 */
export function matchShortcut(
  input: KeyInput,
  shortcuts: readonly { key: string; target: string }[],
): string | null {
  if (input.typing || input.ctrlKey || input.metaKey || input.altKey) return null
  return shortcuts.find((s) => s.key === input.key)?.target ?? null
}

/** Foco num lugar onde a pessoa digita? */
export function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable === true
}

/**
 * Ctrl+K (ou Cmd+K no Mac) abre a busca. Funciona até dentro do terminal:
 * é uma combinação, não rouba letra de quem digita.
 */
export function isPaletteKey(input: Pick<KeyInput, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): boolean {
  return (input.ctrlKey || input.metaKey) && !input.altKey && input.key.toLowerCase() === 'k'
}
