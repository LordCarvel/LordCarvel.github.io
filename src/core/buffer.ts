import type { ComponentType } from 'react'
import type { Lang, Localized } from '../i18n/lang'

/** Cor de um trecho de linha. O <Doc> traduz cada uma para classes do Tailwind. */
export type SpanKind =
  | 'plain'
  | 'title'
  | 'muted'
  | 'comment'
  | 'accent'
  | 'warm'
  | 'key'
  | 'str'
  | 'kw'
  | 'prop'

/**
 * Um trecho de texto com cor, link ou comando.
 * `href` com '#/' é rota interna; `run` vira um botão que roda o comando no terminal.
 */
export type Span = { text: string; kind?: SpanKind; href?: string; run?: string }

/** Uma linha do documento. Lista vazia = linha em branco. */
export type Line = Span[]

/**
 * Uma página do portfolio. Chamei de EditorBuffer, não Buffer,
 * porque `Buffer` é uma global do Node (a mesma armadilha de `print` e `history`).
 */
export type EditorBuffer = {
  /** Rota: #/sobre */
  id: string
  /** Nome do arquivo na árvore e na aba: sobre.md / about.md */
  name: Localized
  title: Localized
  /** Pasta virtual: 'projetos'. Sem dir, fica na raiz. */
  dir?: string
  /** Pastas também são buffers (a página de índice delas). */
  isDir?: boolean
  /** Palavras extras para a busca do F9. */
  keywords?: string
  /** Fonte única: o <Doc> desenha estas linhas e o cat/grep do F8 lê as mesmas. */
  lines: (lang: Lang) => Line[]
  /** Só para páginas interativas (demos do F10). */
  Component?: ComponentType
}

/** Trecho com cor. */
export function s(text: string, kind: SpanKind = 'plain'): Span {
  return { text, kind }
}

/** Trecho com link. */
export function a(text: string, href: string): Span {
  return { text, href }
}

/** Trecho clicável que roda um comando (regra 1: tudo que se digita também se clica). */
export function cmd(command: string, text = command): Span {
  return { text, run: command }
}

/** Monta uma linha; string solta vira trecho sem cor. */
export function line(...parts: (Span | string)[]): Line {
  return parts.map((p) => (typeof p === 'string' ? { text: p } : p))
}

export const BLANK: Line = []

/** Texto puro da linha, sem cor nem link (para cat, grep e busca). */
export function lineText(l: Line): string {
  return l.map((span) => span.text).join('')
}
