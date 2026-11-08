/**
 * Roteador por hash: #/sobre → 'sobre'.
 * Hash funciona no GitHub Pages sem configurar nada no servidor,
 * e o voltar/avançar do navegador vem de graça (evento hashchange).
 */

/** Lê o id da rota. Hash vazio ou só '#/' devolve null (página inicial). */
export function parseHash(hash: string): string | null {
  const id = hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (!id) return null
  try {
    return decodeURIComponent(id)
  } catch {
    return id // % solto na URL: usa como veio
  }
}

export function toHash(id: string): string {
  return `#/${encodeURIComponent(id)}`
}

/** Rota final: o id do hash se existir, senão a página padrão. */
export function resolveRoute(hash: string, exists: (id: string) => boolean, fallback: string): string {
  const id = parseHash(hash)
  return id !== null && exists(id) ? id : fallback
}
