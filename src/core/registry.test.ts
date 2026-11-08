import { describe, expect, it } from 'vitest'
import type { EditorBuffer } from './buffer'
import { createRegistry } from './registry'

function buffer(id: string, extra: Partial<EditorBuffer> = {}): EditorBuffer {
  return {
    id,
    name: { pt: `${id}.md`, en: `${id}.md` },
    title: { pt: id, en: id },
    lines: () => [],
    ...extra,
  }
}

describe('createRegistry', () => {
  it('acha um buffer pelo id', () => {
    const reg = createRegistry([buffer('perfil'), buffer('sobre')])
    expect(reg.get('sobre')?.id).toBe('sobre')
    expect(reg.has('sobre')).toBe(true)
  })

  it('id desconhecido devolve undefined', () => {
    const reg = createRegistry([buffer('perfil')])
    expect(reg.get('xyz')).toBeUndefined()
    expect(reg.has('xyz')).toBe(false)
  })

  it('all() mantém a ordem de registro', () => {
    const reg = createRegistry([buffer('b'), buffer('a'), buffer('c')])
    expect(reg.all().map((b) => b.id)).toEqual(['b', 'a', 'c'])
  })

  it('recusa id duplicado', () => {
    expect(() => createRegistry([buffer('perfil'), buffer('perfil')])).toThrow('duplicado')
  })

  it('recusa arquivo numa pasta que não existe', () => {
    expect(() => createRegistry([buffer('cdatra', { dir: 'projetos' })])).toThrow('projetos')
  })

  it('aceita arquivo numa pasta registrada antes', () => {
    const reg = createRegistry([buffer('projetos', { isDir: true }), buffer('cdatra', { dir: 'projetos' })])
    expect(reg.get('cdatra')?.dir).toBe('projetos')
  })
})
