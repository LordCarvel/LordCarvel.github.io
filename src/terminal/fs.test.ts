import { describe, expect, it } from 'vitest'
import type { EditorBuffer } from '../core/buffer'
import { buildFs, displayName, findDir, pathOf, relativePath, resolvePath, walk, type FsNode } from './fs'

function buffer(id: string, pt: string, en: string, extra: Partial<EditorBuffer> = {}): EditorBuffer {
  return { id, name: { pt, en }, title: { pt: id, en: id }, lines: () => [], ...extra }
}

const root = buildFs([
  buffer('perfil', 'perfil.md', 'profile.md'),
  buffer('sobre', 'sobre.md', 'about.md'),
  buffer('projetos', 'projetos/', 'projects/', { isDir: true }),
  buffer('cdatra', 'Cdatra.java', 'Cdatra.java', { dir: 'projetos' }),
])
const projetos = findDir(root, 'projetos')
const id = (n: FsNode | null) => (n === null ? null : (n.buffer?.id ?? '~'))

describe('buildFs', () => {
  it('raiz tem os arquivos sem pasta e as pastas com os filhos', () => {
    expect(root.children!.map(id)).toEqual(['perfil', 'sobre', 'projetos'])
    expect(projetos.children!.map(id)).toEqual(['cdatra'])
  })

  it('walk percorre tudo em ordem', () => {
    expect(walk(root).map(id)).toEqual(['perfil', 'sobre', 'projetos', 'cdatra'])
  })
})

describe('resolvePath', () => {
  it('vazio e . são a pasta atual', () => {
    expect(id(resolvePath(root, projetos, ''))).toBe('projetos')
    expect(id(resolvePath(root, projetos, '.'))).toBe('projetos')
  })

  it('~ e / levam à raiz', () => {
    expect(id(resolvePath(root, projetos, '~'))).toBe('~')
    expect(id(resolvePath(root, projetos, '/'))).toBe('~')
    expect(id(resolvePath(root, projetos, '~/sobre.md'))).toBe('sobre')
  })

  it('.. sobe e na raiz continua na raiz', () => {
    expect(id(resolvePath(root, projetos, '..'))).toBe('~')
    expect(id(resolvePath(root, root, '..'))).toBe('~')
    expect(id(resolvePath(root, projetos, '../sobre.md'))).toBe('sobre')
  })

  it('aceita barra no fim de pasta, nome em inglês e qualquer caixa', () => {
    expect(id(resolvePath(root, root, 'projetos/'))).toBe('projetos')
    expect(id(resolvePath(root, root, 'projects/Cdatra.java'))).toBe('cdatra')
    expect(id(resolvePath(root, root, 'PROJETOS/cdatra.JAVA'))).toBe('cdatra')
  })

  it('caminho que não existe devolve null', () => {
    expect(resolvePath(root, root, 'nada')).toBeNull()
    expect(resolvePath(root, root, 'projetos/nada')).toBeNull()
  })

  it('não entra dentro de arquivo', () => {
    expect(resolvePath(root, root, 'sobre.md/x')).toBeNull()
    expect(resolvePath(root, root, 'sobre.md/')).toBeNull()
  })
})

describe('nomes e caminhos', () => {
  const cdatra = resolvePath(root, root, 'projetos/Cdatra.java')!

  it('pathOf monta o caminho completo na língua pedida', () => {
    expect(pathOf(cdatra, 'en')).toBe('~/projects/Cdatra.java')
    expect(pathOf(root, 'pt')).toBe('~')
  })

  it('displayName põe / nas pastas', () => {
    expect(displayName(projetos, 'pt')).toBe('projetos/')
    expect(displayName(cdatra, 'pt')).toBe('Cdatra.java')
  })

  it('relativePath encurta o que está dentro da pasta', () => {
    expect(relativePath(root, cdatra, 'pt')).toBe('projetos/Cdatra.java')
    expect(relativePath(projetos, cdatra, 'pt')).toBe('Cdatra.java')
    expect(relativePath(projetos, resolvePath(root, root, 'sobre.md')!, 'pt')).toBe('~/sobre.md')
  })
})
