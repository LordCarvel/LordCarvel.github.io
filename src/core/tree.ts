/** Nó da árvore de arquivos. Pastas têm `children`. */
export type TreeNode = {
  id: string
  name: string
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
