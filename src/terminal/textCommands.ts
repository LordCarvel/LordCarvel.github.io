// Comandos de texto, que também funcionam em pipe: grep, head, tail, wc, sort.
import { line, lineText, s, type Line, type Span } from '../core/buffer'
import { terminalText as T } from '../data/terminal'
import { isDir, relativePath, resolvePath, walk } from './fs'
import { nodeSpan, readFile } from './fsCommands'
import { errorLine, fail, type Command, type CommandContext } from './types'

/**
 * A entrada de um comando de texto: os arquivos passados ou, sem arquivos, o que veio do pipe.
 * null quando não tem nenhum dos dois.
 */
function readInput(ctx: CommandContext, command: string, files: string[]): Line[] | null {
  if (files.length === 0) return ctx.stdin
  return files.flatMap((f) => {
    const r = readFile(ctx, command, f)
    return r.error ? [r.error] : r.lines
  })
}

/** Lê o número de linhas: -n 5, -n5 ou -5. Devolve o número e o resto dos argumentos. */
export function parseCount(args: string[], fallback = 10): { n: number; rest: string[] } {
  const rest: string[] = []
  let n = fallback
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '-n' && i + 1 < args.length) n = Number(args[++i])
    else if (/^-n\d+$/.test(arg)) n = Number(arg.slice(2))
    else if (/^-\d+$/.test(arg)) n = Number(arg.slice(1))
    else rest.push(arg)
  }
  return { n: Number.isFinite(n) && n >= 0 ? n : fallback, rest }
}

/** Quebra o texto em trechos, marcando cada ocorrência de `pattern` (sem diferenciar maiúscula). */
export function highlight(text: string, pattern: string): Span[] {
  if (!pattern) return [s(text)]
  const spans: Span[] = []
  const lower = text.toLowerCase()
  const p = pattern.toLowerCase()
  let from = 0
  for (let at = lower.indexOf(p); at >= 0; at = lower.indexOf(p, at + p.length)) {
    if (at > from) spans.push(s(text.slice(from, at)))
    spans.push(s(text.slice(at, at + p.length), 'match'))
    from = at + p.length
  }
  if (from < text.length) spans.push(s(text.slice(from)))
  return spans
}

const contains = (l: Line, pattern: string) => lineText(l).toLowerCase().includes(pattern.toLowerCase())

export const grep: Command = {
  names: { pt: 'grep', en: 'grep' },
  group: 'text',
  summary: {
    pt: 'procura um texto (sem arquivo, procura em todos daqui para baixo)',
    en: 'searches for text (with no file, searches everything from here down)',
  },
  usage: 'grep <texto> [arquivo]...',
  run: (args, ctx) => {
    const [pattern, ...files] = args.filter((x) => x !== '-i' && x !== '-r')
    if (pattern === undefined) return fail(ctx, 'grep', T.missingOperand)

    // Com pipe: filtra as linhas que chegaram.
    if (files.length === 0 && ctx.stdin) {
      return { lines: ctx.stdin.filter((l) => contains(l, pattern)).map((l) => line(...highlight(lineText(l), pattern))) }
    }

    // Sem arquivos: procura em tudo abaixo da pasta atual, como grep -r.
    const targets =
      files.length === 0
        ? walk(ctx.cwd).filter((n) => !isDir(n))
        : files.flatMap((f) => {
            const node = resolvePath(ctx.fs, ctx.cwd, f)
            return node ? (isDir(node) ? walk(node).filter((n) => !isDir(n)) : [node]) : []
          })

    const missing = files.filter((f) => !resolvePath(ctx.fs, ctx.cwd, f)).map((f) => errorLine(ctx, 'grep', T.noSuchFile, f))
    const prefix = targets.length > 1 || files.length === 0

    const found = targets.flatMap((node) =>
      node
        .buffer!.lines(ctx.lang)
        .filter((l) => contains(l, pattern))
        .map((l) =>
          line(
            ...(prefix ? [nodeSpan(ctx, node, relativePath(ctx.cwd, node, ctx.lang)), s(':', 'muted')] : []),
            ...highlight(lineText(l), pattern),
          ),
        ),
    )
    return { lines: [...missing, ...found] }
  },
}

function slicer(name: 'head' | 'tail', summary: Command['summary']): Command {
  return {
    names: { pt: name, en: name },
    group: 'text',
    summary,
    usage: `${name} [-n N] [arquivo]`,
    run: (args, ctx) => {
      const { n, rest } = parseCount(args)
      const input = readInput(ctx, name, rest)
      if (!input) return fail(ctx, name, T.noInput)
      return { lines: name === 'head' ? input.slice(0, n) : n === 0 ? [] : input.slice(-n) }
    },
  }
}

export const head = slicer('head', { pt: 'mostra as primeiras linhas (10 por padrão)', en: 'prints the first lines (10 by default)' })
export const tail = slicer('tail', { pt: 'mostra as últimas linhas (10 por padrão)', en: 'prints the last lines (10 by default)' })

export const wc: Command = {
  names: { pt: 'wc', en: 'wc' },
  group: 'text',
  summary: { pt: 'conta linhas, palavras e caracteres (-l só linhas)', en: 'counts lines, words and characters (-l lines only)' },
  usage: 'wc [-l] [arquivo]',
  run: (args, ctx) => {
    const files = args.filter((x) => !x.startsWith('-'))
    const input = readInput(ctx, 'wc', files)
    if (!input) return fail(ctx, 'wc', T.noInput)
    const text = input.map(lineText)
    const counts = args.includes('-l')
      ? [text.length]
      : [text.length, text.join(' ').split(/\s+/).filter(Boolean).length, text.join('\n').length]
    return { lines: [line(counts.map((c) => String(c).padStart(4)).join(' ') + (files[0] ? ` ${files[0]}` : ''))] }
  },
}

export const sort: Command = {
  names: { pt: 'sort', en: 'sort' },
  group: 'text',
  summary: { pt: 'ordena as linhas (-r ao contrário)', en: 'sorts lines (-r reversed)' },
  usage: 'sort [-r] [arquivo]',
  run: (args, ctx) => {
    const input = readInput(ctx, 'sort', args.filter((x) => !x.startsWith('-')))
    if (!input) return fail(ctx, 'sort', T.noInput)
    const sorted = [...input].sort((x, y) => lineText(x).localeCompare(lineText(y), ctx.lang))
    return { lines: args.includes('-r') ? sorted.reverse() : sorted }
  },
}

export const textCommands: Command[] = [grep, head, tail, wc, sort]
