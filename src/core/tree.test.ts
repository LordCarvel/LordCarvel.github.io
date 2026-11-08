import { describe, expect, it } from 'vitest'
import { findNode, iconFor, type TreeNode } from './tree'

const tree: TreeNode[] = [
  { id: 'perfil', name: { pt: 'perfil.md', en: 'profile.md' }, icon: '#' },
  {
    id: 'projetos',
    name: { pt: 'projetos/', en: 'projects/' },
    icon: '▾',
    children: [{ id: 'cdatra', name: { pt: 'Cdatra.java', en: 'Cdatra.java' }, icon: '☕' }],
  },
]

describe('findNode', () => {
  it('acha um nó na raiz', () => {
    expect(findNode(tree, 'perfil')?.name.pt).toBe('perfil.md')
  })

  it('acha a própria pasta', () => {
    expect(findNode(tree, 'projetos')?.name.en).toBe('projects/')
  })

  it('acha um nó dentro de uma pasta', () => {
    expect(findNode(tree, 'cdatra')?.icon).toBe('☕')
  })

  it('devolve undefined para um id que não existe', () => {
    expect(findNode(tree, 'xyz')).toBeUndefined()
  })
})

describe('iconFor', () => {
  it('usa a extensão, sem diferenciar maiúscula', () => {
    expect(iconFor('Cdatra.java')).toBe('☕')
    expect(iconFor('README.MD')).toBe('#')
  })

  it('pasta vira ▾', () => {
    expect(iconFor('projetos/')).toBe('▾')
  })

  it('extensão desconhecida ou sem extensão vira ·', () => {
    expect(iconFor('foto.png')).toBe('·')
    expect(iconFor('Makefile')).toBe('·')
  })
})
