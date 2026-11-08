// Completar com Tab: a primeira palavra completa comandos, as outras completam caminhos.
import type { Lang } from '../i18n/lang'
import { displayName, isDir, resolvePath, type FsNode } from './fs'

export type Completion = {
  /** A linha completa depois do Tab. */
  value: string
  /** Mais de uma opção: o terminal mostra a lista. */
  options: string[]
}

/** Maior começo em comum entre as opções (sem diferenciar maiúscula). */
export function commonPrefix(options: readonly string[]): string {
  if (options.length === 0) return ''
  let prefix = options[0]
  for (const o of options.slice(1)) {
    let i = 0
    while (i < prefix.length && i < o.length && prefix[i].toLowerCase() === o[i].toLowerCase()) i++
    prefix = prefix.slice(0, i)
  }
  return prefix
}

export function complete(
  input: string,
  ctx: { fs: FsNode; cwd: FsNode; lang: Lang; commandNames: readonly string[] },
): Completion {
  const start = input.lastIndexOf(' ') + 1
  const before = input.slice(0, start)
  const word = input.slice(start)

  let candidates: string[]
  let base = '' // parte do caminho que já está certa (ex.: "projetos/")

  if (before.trim() === '') {
    candidates = ctx.commandNames.filter((n) => n.startsWith(word.toLowerCase()))
  } else {
    const slash = word.lastIndexOf('/')
    base = word.slice(0, slash + 1)
    const partial = word.slice(slash + 1).toLowerCase()
    const dir = resolvePath(ctx.fs, ctx.cwd, base || '.')
    if (!dir || !isDir(dir)) return { value: input, options: [] }
    candidates = dir.children!.map((n) => displayName(n, ctx.lang)).filter((n) => n.toLowerCase().startsWith(partial))
  }

  candidates.sort()
  if (candidates.length === 0) return { value: input, options: [] }

  if (candidates.length === 1) {
    const only = candidates[0]
    // Pasta termina em / (dá para continuar com Tab); o resto ganha espaço, como no bash.
    return { value: before + base + only + (only.endsWith('/') ? '' : ' '), options: [] }
  }

  const prefix = commonPrefix(candidates)
  const value = before + base + (prefix.length > word.length - base.length ? prefix : word.slice(base.length))
  return { value, options: candidates }
}
