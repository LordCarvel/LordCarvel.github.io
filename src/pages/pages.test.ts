import { describe, expect, it } from 'vitest'
import { lineText } from '../core/buffer'
import { parseHash } from '../core/router'
import { LANGS } from '../i18n/lang'
import { HOME, pages, registry } from './index'

describe('páginas registradas', () => {
  it('a página inicial existe', () => {
    expect(registry.has(HOME)).toBe(true)
  })

  it.each(pages.map((p) => [p.id, p] as const))('%s tem conteúdo nas duas línguas', (_, page) => {
    for (const lang of LANGS) {
      const lines = page.lines(lang)
      expect(lines.length).toBeGreaterThan(0)
      expect(lines.some((l) => lineText(l).trim() !== '')).toBe(true)
    }
  })

  it('todo link interno aponta para uma página que existe', () => {
    for (const page of pages) {
      for (const lang of LANGS) {
        for (const span of page.lines(lang).flat()) {
          if (!span.href?.startsWith('#')) continue
          const id = parseHash(span.href)
          expect(id !== null && registry.has(id), `${page.id} → ${span.href}`).toBe(true)
        }
      }
    }
  })
})
