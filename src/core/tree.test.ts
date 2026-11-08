import { describe, expect, it } from 'vitest'
import type { EditorBuffer } from './buffer'
import { buildTree, iconFor } from './tree'

function buffer(id: string, file: string, extra: Partial<EditorBuffer> = {}): EditorBuffer {
  return { id, name: { pt: file, en: file }, title: { pt: id, en: id }, lines: () => [], ...extra }
}

describe('buildTree', () => {
  const buffers = [
    buffer('perfil', 'perfil.md'),
    buffer('projetos', 'projetos/', { isDir: true }),
    buffer('cdatra', 'Cdatra.java', { dir: 'projetos' }),
    buffer('contato', 'contato.sh'),
    buffer('easy-hub', 'EasyHub.jsx', { dir: 'projetos' }),
  ]

  it('na raiz ficam só os buffers sem pasta, na ordem de registro', () => {
    expect(buildTree(buffers).map((n) => n.id)).toEqual(['perfil', 'projetos', 'contato'])
  })

  it('a pasta recebe os filhos, mesmo registrados depois de outros arquivos', () => {
    const dir = buildTree(buffers).find((n) => n.id === 'projetos')
    expect(dir?.children?.map((n) => n.id)).toEqual(['cdatra', 'easy-hub'])
  })

  it('arquivo comum não tem children', () => {
    expect(buildTree(buffers)[0].children).toBeUndefined()
  })

  it('o ícone sai da extensão', () => {
    expect(buildTree(buffers).map((n) => n.icon)).toEqual(['#', '▾', '$'])
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
