import { createContext } from 'react'
import type { EditorBuffer } from '../core/buffer'
import type { Registry } from '../core/registry'

export type EditorContextValue = {
  registry: Registry
  /** Buffer aberto agora (vem da URL). */
  buffer: EditorBuffer
  /** Ids das abas abertas, na ordem. */
  tabs: string[]
  open: (id: string) => void
  close: (id: string) => void
}

export const EditorContext = createContext<EditorContextValue | null>(null)
