/// <reference types="node" />
// Confere as cores direto do CSS: o src/index.css continua sendo a única fonte,
// e este teste falha se um tema novo (ou um ajuste) quebrar o contraste AA.
// Lê o arquivo do disco porque o Vitest esvazia imports de CSS (até com ?raw).
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AA, contrast } from './contrast'
import { THEMES } from './index'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf-8')

type Palette = Record<string, string>

function readVars(block: string): Palette {
  const vars: Palette = {}
  for (const [, name, value] of block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{3,6})\b/gi)) vars[name] = value
  return vars
}

const themeBlock = readVars(/@theme\s*\{([\s\S]*?)\n\}/.exec(css)![1])
const blocks = new Map<string, Palette>()
for (const [, id, body] of css.matchAll(/\[data-theme="([^"]+)"\]\s*\{([\s\S]*?)\}/g)) {
  blocks.set(id, { ...blocks.get(id), ...readVars(body) })
}

// Texto que aparece em cima de cada fundo.
const TEXT = ['fg', 'muted', 'accent', 'warm', 'blue', 'err', 'violet']
const BACKGROUNDS = ['bg', 'panel', 'panel-2', 'hl']

describe('temas no CSS', () => {
  it('todo tema da lista tem um bloco [data-theme] com as 13 cores', () => {
    for (const t of THEMES) expect(Object.keys(blocks.get(t.id) ?? {}).sort(), t.id).toEqual(Object.keys(themeBlock).sort())
  })

  it('o workspace repete exatamente o @theme', () => {
    expect(blocks.get('workspace')).toEqual(themeBlock)
  })

  it.each(THEMES.map((t) => [t.id]))('%s passa no contraste AA (4.5:1)', (id) => {
    const p = blocks.get(id)!
    const failures: string[] = []
    for (const text of TEXT) {
      for (const bg of BACKGROUNDS) {
        const ratio = contrast(p[text], p[bg])
        if (ratio < AA) failures.push(`${text} em ${bg}: ${ratio.toFixed(2)}`)
      }
    }
    const ink = contrast(p['accent-ink'], p.accent) // o NORMAL da barra de status
    if (ink < AA) failures.push(`accent-ink em accent: ${ink.toFixed(2)}`)
    expect(failures).toEqual([])
  })
})
