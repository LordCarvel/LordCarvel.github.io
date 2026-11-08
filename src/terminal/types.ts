import { line, s, type Line } from '../core/buffer'
import type { Registry } from '../core/registry'
import { loc, type Lang, type Localized } from '../i18n/lang'
import type { FsNode } from './fs'

/** O que um comando pode usar do resto do site. Os testes passam uma versão falsa. */
export type CommandContext = {
  lang: Lang
  registry: Registry
  /** Raiz do sistema de arquivos virtual. */
  fs: FsNode
  /** Pasta atual. */
  cwd: FsNode
  setCwd: (dir: FsNode) => void
  open: (id: string) => void
  setLang: (lang: Lang) => void
  /** Tema escolhido agora e como trocar. */
  theme: string
  setTheme: (id: string) => void
  cmdHistory: readonly string[]
  /** Saída da etapa anterior do pipe; null quando o comando é o primeiro. */
  stdin: Line[] | null
}

export type CommandResult = { lines: Line[]; clear?: boolean }

export type CommandGroup = 'files' | 'text' | 'portfolio' | 'system'

export type Command = {
  /** Nome mostrado no help, em cada língua. Os dois funcionam ao digitar. */
  names: Localized
  aliases?: string[]
  group: CommandGroup
  summary: Localized
  /** Sintaxe para o man, ex.: 'ls [-la] [caminho]'. */
  usage: string
  run: (args: string[], ctx: CommandContext) => CommandResult
}

/** Mensagem de erro no formato de shell: `cat: x: arquivo não encontrado`. */
export function fail(ctx: CommandContext, command: string, message: Localized, subject?: string): CommandResult {
  return { lines: [errorLine(ctx, command, message, subject)] }
}

export function errorLine(ctx: CommandContext, command: string, message: Localized, subject?: string): Line {
  return line(s(`${command}: ${subject !== undefined ? `${subject}: ` : ''}${loc(message, ctx.lang)}`, 'warm'))
}
