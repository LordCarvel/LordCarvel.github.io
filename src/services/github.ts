// API pública do GitHub, sem token: 60 requisições por hora por IP.
// O cache de 15 min no sessionStorage evita gastar esse limite enquanto alguém navega.
import { parsePushes, parseRepos, type Push, type Repo } from '../core/github'
import { profile } from '../data/profile'
import { projects } from '../data/projects'

export const CACHE_TTL = 15 * 60_000
const TIMEOUT = 8_000
const BASE = `https://api.github.com/users/${profile.githubUser}`

/** O que o cache usa do mundo de fora. Os testes trocam tudo isso por versões falsas. */
export type CacheDeps = {
  storage: Pick<Storage, 'getItem' | 'setItem'> | null
  now: () => number
  fetch: (url: string, init?: RequestInit) => Promise<Response>
}

function browserDeps(): CacheDeps {
  let storage: Storage | null
  try {
    storage = sessionStorage // pode lançar erro com cookies bloqueados
  } catch {
    storage = null
  }
  return { storage, now: Date.now, fetch: (url, init) => fetch(url, init) }
}

// Duas telas pedindo a mesma URL ao mesmo tempo dividem uma requisição só.
const pending = new Map<string, Promise<unknown>>()

export async function cachedJson(key: string, url: string, deps: CacheDeps = browserDeps()): Promise<unknown> {
  try {
    const hit = deps.storage?.getItem(key)
    if (hit) {
      const { at, data } = JSON.parse(hit) as { at: number; data: unknown }
      if (deps.now() - at < CACHE_TTL) return data
    }
  } catch {
    // cache corrompido ou indisponível: segue para a rede
  }

  let request = pending.get(key)
  if (!request) {
    request = deps
      .fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(TIMEOUT) })
      .then(async (res) => {
        if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`)
        const data: unknown = await res.json()
        try {
          deps.storage?.setItem(key, JSON.stringify({ at: deps.now(), data }))
        } catch {
          // sem espaço ou sem storage: o cache é opcional
        }
        return data
      })
      .finally(() => pending.delete(key))
    pending.set(key, request)
  }
  return request
}

export async function getRepos(): Promise<Repo[]> {
  return parseRepos(await cachedJson('gh:repos', `${BASE}/repos?sort=pushed&per_page=100`))
}

export async function getPushes(): Promise<Push[]> {
  return parsePushes(await cachedJson('gh:events', `${BASE}/events/public?per_page=100`))
}

/** Plano B: os repositórios dos projetos em src/data, sem data de push. */
export const fallbackRepos: Repo[] = projects.map((p) => ({
  name: p.repo,
  url: `${profile.links.github}/${p.repo}`,
  language: p.tech[0] ?? null,
  pushedAt: null,
}))
