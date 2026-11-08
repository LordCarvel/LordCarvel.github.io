// Histórico de comandos (chamado cmdHistory em volta, para não confundir com window.history).

export const HISTORY_MAX = 50

/** Guarda o comando, sem linhas vazias nem repetir o último. Mantém no máximo `max`. */
export function addToHistory(items: readonly string[], command: string, max = HISTORY_MAX): string[] {
  const cmd = command.trim()
  if (!cmd || items.at(-1) === cmd) return [...items]
  return [...items, cmd].slice(-max)
}

/**
 * Anda no histórico com as setas.
 * `cursor` null = editando uma linha nova; 0 = o comando mais antigo.
 * Descer depois do último volta para a linha nova, vazia.
 */
export function browseHistory(
  items: readonly string[],
  cursor: number | null,
  direction: 'up' | 'down',
): { cursor: number | null; value: string } {
  if (items.length === 0) return { cursor: null, value: '' }

  if (direction === 'up') {
    const next = cursor === null ? items.length - 1 : Math.max(0, cursor - 1)
    return { cursor: next, value: items[next] }
  }

  if (cursor === null || cursor >= items.length - 1) return { cursor: null, value: '' }
  return { cursor: cursor + 1, value: items[cursor + 1] }
}
