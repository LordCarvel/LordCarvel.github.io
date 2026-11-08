// Comandos de arquivo: pwd, cd, ls, cat, open, tree, find.
import { a, cmd, line, s, type Line, type Span } from '../core/buffer'
import { toHash } from '../core/router'
import { terminalText as T, treeWords } from '../data/terminal'
import { loc } from '../i18n/lang'
import { displayName, isDir, nodeName, pathOf, relativePath, resolvePath, walk, type FsNode } from './fs'
import { errorLine, fail, type Command, type CommandContext } from './types'

/** Nome clicável: pasta roda `cd`, arquivo abre a página. */
export function nodeSpan(ctx: CommandContext, node: FsNode, text = displayName(node, ctx.lang)): Span {
  if (!node.buffer) return s(text, 'prop')
  if (isDir(node)) return cmd(`cd ${pathOf(node, ctx.lang)}`, text, 'prop')
  return a(text, toHash(node.buffer.id))
}

/** Linhas de um arquivo, ou o erro de shell certo. */
export function readFile(ctx: CommandContext, command: string, path: string): { lines: Line[]; error?: Line } {
  const node = resolvePath(ctx.fs, ctx.cwd, path)
  if (!node) return { lines: [], error: errorLine(ctx, command, T.noSuchFile, path) }
  if (isDir(node) || !node.buffer) return { lines: [], error: errorLine(ctx, command, T.isDir, path) }
  return { lines: node.buffer.lines(ctx.lang) }
}

const flagsOf = (args: string[]) => args.filter((x) => x.startsWith('-')).join('')
const operands = (args: string[]) => args.filter((x) => !x.startsWith('-'))

export const pwd: Command = {
  names: { pt: 'pwd', en: 'pwd' },
  group: 'files',
  summary: { pt: 'mostra a pasta atual', en: 'prints the current directory' },
  usage: 'pwd',
  run: (_, ctx) => ({ lines: [line(pathOf(ctx.cwd, ctx.lang))] }),
}

export const cd: Command = {
  names: { pt: 'cd', en: 'cd' },
  group: 'files',
  summary: { pt: 'entra numa pasta (cd .. sobe, cd volta ao início)', en: 'changes directory (cd .. goes up, cd goes home)' },
  usage: 'cd [caminho]',
  run: (args, ctx) => {
    const path = operands(args)[0] ?? '~'
    const node = resolvePath(ctx.fs, ctx.cwd, path)
    if (!node) return fail(ctx, 'cd', T.noSuchFile, path)
    if (!isDir(node)) return fail(ctx, 'cd', T.notDir, path)
    ctx.setCwd(node)
    return { lines: [] }
  },
}

function permissions(node: FsNode) {
  return isDir(node) ? 'drwxr-xr-x' : '-rw-r--r--'
}

/** Tamanho no ls -l: itens da pasta ou linhas do arquivo. */
function size(ctx: CommandContext, node: FsNode) {
  return isDir(node) ? node.children!.length : (node.buffer?.lines(ctx.lang).length ?? 0)
}

export const ls: Command = {
  names: { pt: 'ls', en: 'ls' },
  aliases: ['dir'],
  group: 'files',
  summary: { pt: 'lista arquivos (-l detalhes, -a tudo)', en: 'lists files (-l details, -a all)' },
  usage: 'ls [-la] [caminho]',
  run: (args, ctx) => {
    const flags = flagsOf(args)
    const path = operands(args)[0] ?? ''
    const node = resolvePath(ctx.fs, ctx.cwd, path)
    if (!node) return fail(ctx, 'ls', T.noSuchFile, path)

    const items = isDir(node) ? node.children! : [node]
    const special: [string, FsNode][] = flags.includes('a') && isDir(node) ? [['.', node], ['..', node.parent ?? ctx.fs]] : []

    if (flags.includes('l')) {
      return {
        lines: [
          ...special.map(([name, n]) => line(s(`${permissions(n)}  ${String(size(ctx, n)).padStart(3)}  `, 'muted'), nodeSpan(ctx, n, name))),
          ...items.map((n) => line(s(`${permissions(n)}  ${String(size(ctx, n)).padStart(3)}  `, 'muted'), nodeSpan(ctx, n))),
        ],
      }
    }

    const spans = [...special.map(([name, n]) => nodeSpan(ctx, n, name)), ...items.map((n) => nodeSpan(ctx, n))]
    return { lines: [line(...spans.flatMap((sp, i) => (i > 0 ? [s('  '), sp] : [sp])))] }
  },
}

export const cat: Command = {
  names: { pt: 'cat', en: 'cat' },
  group: 'files',
  summary: { pt: 'mostra o conteúdo de um arquivo', en: 'prints file contents' },
  usage: 'cat <arquivo>...',
  run: (args, ctx) => {
    const files = operands(args)
    if (files.length === 0) return ctx.stdin ? { lines: ctx.stdin } : fail(ctx, 'cat', T.missingOperand)
    return {
      lines: files.flatMap((f) => {
        const r = readFile(ctx, 'cat', f)
        return r.error ? [r.error] : r.lines
      }),
    }
  },
}

export const open: Command = {
  names: { pt: 'open', en: 'open' },
  aliases: ['vim', 'nvim', 'code', 'abrir'],
  group: 'files',
  summary: { pt: 'abre o arquivo no editor', en: 'opens the file in the editor' },
  usage: 'open <arquivo>',
  run: (args, ctx) => {
    const path = operands(args)[0]
    if (path === undefined) return fail(ctx, 'open', T.missingOperand)
    const node = resolvePath(ctx.fs, ctx.cwd, path)
    if (!node?.buffer) return fail(ctx, 'open', T.noSuchFile, path)
    ctx.open(node.buffer.id)
    return { lines: [line(s(`${loc(T.opening, ctx.lang)} `, 'muted'), s(displayName(node, ctx.lang), 'warm'))] }
  },
}

export const tree: Command = {
  names: { pt: 'tree', en: 'tree' },
  group: 'files',
  summary: { pt: 'mostra as pastas em árvore', en: 'shows directories as a tree' },
  usage: 'tree [caminho]',
  run: (args, ctx) => {
    const path = operands(args)[0] ?? ''
    const start = resolvePath(ctx.fs, ctx.cwd, path)
    if (!start) return fail(ctx, 'tree', T.noSuchFile, path)

    const lines: Line[] = [line(nodeSpan(ctx, start, path || '.'))]
    let dirs = 0
    let files = 0

    function draw(node: FsNode, prefix: string) {
      node.children?.forEach((child, i) => {
        const last = i === node.children!.length - 1
        lines.push(line(s(`${prefix}${last ? '└── ' : '├── '}`, 'muted'), nodeSpan(ctx, child)))
        if (isDir(child)) {
          dirs++
          draw(child, `${prefix}${last ? '    ' : '│   '}`)
        } else files++
      })
    }

    draw(start, '')
    const words = loc(treeWords, ctx.lang)
    const count = (n: number, [one, many]: [string, string]) => `${n} ${n === 1 ? one : many}`
    lines.push(line(), line(s(`${count(dirs, words.dir)}, ${count(files, words.file)}`, 'muted')))
    return { lines }
  },
}

/** Converte um glob simples (* e ?) em regex. */
export function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`, 'i')
}

export const find: Command = {
  names: { pt: 'find', en: 'find' },
  group: 'files',
  summary: { pt: 'procura arquivos pelo nome', en: 'finds files by name' },
  usage: "find [caminho] [-name '*.java']",
  run: (args, ctx) => {
    const nameAt = args.indexOf('-name')
    const pattern = nameAt >= 0 ? args[nameAt + 1] : undefined
    const path = args.find((x, i) => !x.startsWith('-') && i !== nameAt + 1 && (nameAt < 0 || i < nameAt)) ?? ''
    const start = resolvePath(ctx.fs, ctx.cwd, path)
    if (!start) return fail(ctx, 'find', T.noSuchFile, path)

    const re = pattern ? globToRegExp(pattern) : null
    const found = walk(start).filter((n) => !re || re.test(nodeName(n, 'pt')) || re.test(nodeName(n, 'en')))
    return { lines: found.map((n) => line(nodeSpan(ctx, n, relativePath(ctx.cwd, n, ctx.lang)))) }
  },
}

export const fsCommands: Command[] = [pwd, ls, cd, cat, open, tree, find]
