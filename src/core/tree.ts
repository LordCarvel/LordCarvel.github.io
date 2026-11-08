import type { Localized } from '../i18n/lang'

/** Nó da árvore de arquivos. Pastas têm `children`. */
export type TreeNode = {
  id: string
  name: Localized
  icon: string
  children?: TreeNode[]
}

/** Busca um nó pelo id em qualquer nível da árvore (busca em profundidade). */
export function findNode(nodes: readonly TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = node.children && findNode(node.children, id)
    if (found) return found
  }
  return undefined
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
