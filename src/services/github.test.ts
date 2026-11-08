import { describe, expect, it, vi } from 'vitest'
import { CACHE_TTL, cachedJson, type CacheDeps } from './github'

function fakeDeps(start = 1_000_000) {
  const store = new Map<string, string>()
  let now = start
  const fetch = vi.fn(async () => new Response(JSON.stringify([{ name: 'Cdatra' }]), { status: 200 }))
  const deps: CacheDeps = {
    storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v) },
    now: () => now,
    fetch,
  }
  return { deps, fetch, store, advance: (ms: number) => (now += ms) }
}

describe('cachedJson', () => {
  it('busca na rede e guarda no cache', async () => {
    const { deps, fetch, store } = fakeDeps()
    expect(await cachedJson('k1', 'url', deps)).toEqual([{ name: 'Cdatra' }])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(store.has('k1')).toBe(true)
  })

  it('dentro de 15 min usa o cache sem ir à rede', async () => {
    const { deps, fetch, advance } = fakeDeps()
    await cachedJson('k2', 'url', deps)
    advance(CACHE_TTL - 1)
    await cachedJson('k2', 'url', deps)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('depois de 15 min busca de novo', async () => {
    const { deps, fetch, advance } = fakeDeps()
    await cachedJson('k3', 'url', deps)
    advance(CACHE_TTL)
    await cachedJson('k3', 'url', deps)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('pedidos simultâneos dividem uma requisição', async () => {
    const { deps, fetch } = fakeDeps()
    await Promise.all([cachedJson('k4', 'url', deps), cachedJson('k4', 'url', deps)])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('erro HTTP vira exceção (quem chama decide o plano B)', async () => {
    const { deps } = fakeDeps()
    deps.fetch = async () => new Response('{}', { status: 403 })
    await expect(cachedJson('k5', 'url', deps)).rejects.toThrow('403')
  })

  it('funciona sem storage', async () => {
    const { deps, fetch } = fakeDeps()
    deps.storage = null
    expect(await cachedJson('k6', 'url', deps)).toEqual([{ name: 'Cdatra' }])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('cache corrompido é ignorado', async () => {
    const { deps, store, fetch } = fakeDeps()
    store.set('k7', '{isto não é json')
    await cachedJson('k7', 'url', deps)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
