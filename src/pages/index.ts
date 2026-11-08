import type { EditorBuffer } from '../core/buffer'
import { createRegistry } from '../core/registry'
import { contato } from './contato'
import { curriculo } from './curriculo'
import { perfil } from './perfil'
import { projectPages, projetos } from './projetos'
import { sobre } from './sobre'
import { stack } from './stack'

/** Ordem daqui = ordem da árvore. Pasta antes dos arquivos dela. */
export const pages: EditorBuffer[] = [perfil, sobre, stack, projetos, ...projectPages, curriculo, contato]

export const registry = createRegistry(pages)

export const HOME = perfil.id
