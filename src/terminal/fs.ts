// Sistema de arquivos virtual, montado a partir do registro de buffers.
// Cada página é um arquivo; páginas com isDir são pastas. TS puro, sem React.
import type { EditorBuffer } from '../core/buffer'
import type { Lang } from '../i18n/lang'

export type FsNode = {
  /** null só na raiz (~). */
  buffer: EditorBuffer | null
  /** null em arquivo; lista (talvez vazia) em pasta. */
  children: FsNode[] | null
  parent: FsNode | null
}

export function buildFs(buffers: readonly EditorBuffer[]): FsNode {
  const root: FsNode = { buffer: null, children: [], parent: null }

  function fill(dir: FsNode, dirId: string | undefined) {
    for (const b of buffers.filter((x) => x.dir === dirId)) {
      const node: FsNode = { buffer: b, children: b.isDir ? [] : null, parent: dir }
      dir.children!.push(node)
      if (b.isDir) fill(node, b.id)
    }
  }

  fill(root, undefined)
  return root
}

export function isDir(node: FsNode): boolean {
  return node.children !== null
}

/** Nome na língua pedida, sem a barra final das pastas. A raiz é ~. */
export function nodeName(node: FsNode, lang: Lang): string {
  return node.buffer ? node.buffer.name[lang].replace(/\/$/, '') : '~'
}

/** Nome para listagem: pasta ganha / no fim. */
export function displayName(node: FsNode, lang: Lang): string {
  return isDir(node) && node.buffer ? `${nodeName(node, lang)}/` : nodeName(node, lang)
}

/** Caminho completo: ~/projetos/Cdatra.java */
export function pathOf(node: FsNode, lang: Lang): string {
  const parts: string[] = []
  for (let n: FsNode | null = node; n?.buffer; n = n.parent) parts.unshift(nodeName(n, lang))
  return ['~', ...parts].join('/')
}

/** Caminho de `node` visto a partir de `from`: relativo se estiver dentro, completo se não. */
export function relativePath(from: FsNode, node: FsNode, lang: Lang): string {
  const parts: string[] = []
  for (let n: FsNode | null = node; n && n !== from; n = n.parent) {
    if (!n.buffer) return pathOf(node, lang) // chegou na raiz sem passar por `from`
    parts.unshift(nodeName(n, lang))
  }
  return parts.join('/') || '.'
}

/** Todos os nós abaixo de `node`, em ordem (pasta antes do conteúdo). */
export function walk(node: FsNode): FsNode[] {
  return (node.children ?? []).flatMap((child) => [child, ...walk(child)])
}

/** Acha a pasta pelo id do buffer; null é a raiz. */
export function findDir(root: FsNode, id: string | null): FsNode {
  if (id === null) return root
  return walk(root).find((n) => n.buffer?.id === id && isDir(n)) ?? root
}

/** Um pedaço do caminho bate com o nome do nó? Aceita o nome em pt ou en, sem diferenciar maiúscula. */
function matches(node: FsNode, segment: string): boolean {
  if (!node.buffer) return false
  const s = segment.toLowerCase()
  return (['pt', 'en'] as const).some((l) => node.buffer!.name[l].replace(/\/$/, '').toLowerCase() === s)
}

/**
 * Resolve um caminho digitado a partir da pasta atual.
 * Entende ~ e / (raiz), . (aqui), .. (acima), barra no fim e nomes em pt ou en.
 * Devolve null se não existir ou se tentar entrar dentro de um arquivo.
 */
export function resolvePath(root: FsNode, cwd: FsNode, input: string): FsNode | null {
  let path = input.trim()
  let node = cwd

  if (path === '~' || path.startsWith('~/') || path.startsWith('/')) {
    node = root
    path = path.replace(/^~?\/?/, '')
  }

  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue
    if (!isDir(node)) return null
    if (segment === '..') {
      node = node.parent ?? root
      continue
    }
    const next = node.children!.find((child) => matches(child, segment))
    if (!next) return null
    node = next
  }

  // "sobre.md/" com barra no fim só vale para pasta.
  if (input.trim().endsWith('/') && !isDir(node)) return null
  return node
}
