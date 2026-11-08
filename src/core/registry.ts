import type { EditorBuffer } from './buffer'

export type Registry = {
  get: (id: string) => EditorBuffer | undefined
  has: (id: string) => boolean
  /** Na ordem de registro: é a ordem da árvore. */
  all: () => EditorBuffer[]
}

/**
 * Registro de buffers sobre um Map. Árvore, abas, rotas, busca e shell leem daqui,
 * então uma página nova aparece em todos eles sem mexer em mais nada.
 *
 * Recebe a lista pronta em vez de expor register() global: assim cada teste cria o seu,
 * e o hot reload do Vite não tenta registrar a mesma página duas vezes.
 */
export function createRegistry(buffers: readonly EditorBuffer[]): Registry {
  const map = new Map<string, EditorBuffer>()

  for (const buffer of buffers) {
    if (map.has(buffer.id)) throw new Error(`buffer duplicado: ${buffer.id}`)
    if (buffer.dir && !map.get(buffer.dir)?.isDir) {
      throw new Error(`a pasta "${buffer.dir}" de ${buffer.id} precisa ser registrada antes`)
    }
    map.set(buffer.id, buffer)
  }

  return {
    get: (id) => map.get(id),
    has: (id) => map.has(id),
    all: () => [...map.values()],
  }
}
