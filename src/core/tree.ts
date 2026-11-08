import type { Localized } from '../i18n/lang'
import type { EditorBuffer } from './buffer'

/** Nó da árvore de arquivos. Pastas têm `children`. */
export type TreeNode = {
  id: string
  name: Localized
  icon: string
  children?: TreeNode[]
}

const ICONS: Record<string, string> = {
  md: '#',
  toml: '⚙',
  java: '☕',
  jsx: '⚛',
  js: 'ƒ',
  sh: '$',
  txt: '¶',
}

/** Ícone pela extensão do arquivo; pasta (termina em /) vira ▾. */
export function iconFor(file: string): string {
  if (file.endsWith('/')) return '▾'
  const ext = file.includes('.') ? file.split('.').pop()!.toLowerCase() : ''
  return ICONS[ext] ?? '·'
}

function toNode(buffer: EditorBuffer, all: readonly EditorBuffer[]): TreeNode {
  const node: TreeNode = { id: buffer.id, name: buffer.name, icon: iconFor(buffer.name.pt) }
  if (buffer.isDir) {
    node.children = all.filter((b) => b.dir === buffer.id).map((b) => toNode(b, all))
  }
  return node
}

/** Monta a árvore a partir dos buffers, na ordem de registro. */
export function buildTree(buffers: readonly EditorBuffer[]): TreeNode[] {
  return buffers.filter((b) => !b.dir).map((b) => toNode(b, buffers))
}
