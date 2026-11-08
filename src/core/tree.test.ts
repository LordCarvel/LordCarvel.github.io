import { describe, expect, it } from 'vitest'
import { findNode, type TreeNode } from './tree'

const tree: TreeNode[] = [
  { id: 'perfil', name: 'perfil.md', icon: '#' },
  {
    id: 'projetos',
    name: 'projetos/',
    icon: '▾',
    children: [{ id: 'cdatra', name: 'cdatra.java', icon: '☕' }],
  },
]

describe('findNode', () => {
  it('acha um nó na raiz', () => {
    expect(findNode(tree, 'perfil')?.name).toBe('perfil.md')
  })

  it('acha a própria pasta', () => {
    expect(findNode(tree, 'projetos')?.name).toBe('projetos/')
  })

  it('acha um nó dentro de uma pasta', () => {
    expect(findNode(tree, 'cdatra')?.name).toBe('cdatra.java')
  })

  it('devolve undefined para um id que não existe', () => {
    expect(findNode(tree, 'xyz')).toBeUndefined()
  })
})
