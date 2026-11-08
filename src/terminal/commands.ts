import { cmd, line, s, type Line } from '../core/buffer'
import type { Registry } from '../core/registry'
import { profile } from '../data/profile'
import { terminalText as T } from '../data/terminal'
import { isLang, loc, type Lang, type Localized } from '../i18n/lang'
import { tokenize } from './parse'

/** O que um comando pode usar do resto do site. Os testes passam uma versão falsa. */
export type CommandContext = {
  lang: Lang
  registry: Registry
  open: (id: string) => void
  setLang: (lang: Lang) => void
  cmdHistory: readonly string[]
}

export type CommandResult = { lines: Line[]; clear?: boolean }

export type Command = {
  /** Nome mostrado no help, em cada língua. Os dois funcionam ao digitar. */
  names: Localized
  aliases?: string[]
  summary: Localized
  run: (args: string[], ctx: CommandContext) => CommandResult
}

/** Comando que só abre uma página. */
function opener(id: string, names: Localized, summary: Localized, aliases: string[] = []): Command {
  return {
    names,
    aliases,
    summary,
    run: (_, ctx) => {
      const buffer = ctx.registry.get(id)
      if (!buffer) return { lines: [] }
      ctx.open(id)
      return { lines: [line(s(`${loc(T.opening, ctx.lang)} `, 'muted'), s(loc(buffer.name, ctx.lang), 'warm'))] }
    },
  }
}

const help: Command = {
  names: { pt: 'help', en: 'help' },
  aliases: ['ajuda', '?'],
  summary: { pt: 'lista os comandos', en: 'lists the commands' },
  run: (_, ctx) => {
    const width = Math.max(...commands.map((c) => loc(c.names, ctx.lang).length)) + 2
    return {
      lines: [
        line(s(loc(T.helpTitle, ctx.lang), 'comment')),
        ...commands.map((c) => {
          const name = loc(c.names, ctx.lang)
          return line(cmd(name), ' '.repeat(width - name.length), s(loc(c.summary, ctx.lang), 'muted'))
        }),
      ],
    }
  },
}

export const commands: Command[] = [
  help,
  opener('perfil', { pt: 'perfil', en: 'home' }, { pt: 'volta para o início', en: 'back to the start' }, ['inicio']),
  opener('sobre', { pt: 'sobre', en: 'about' }, { pt: 'quem eu sou', en: 'who I am' }),
  opener('projetos', { pt: 'projetos', en: 'projects' }, { pt: 'o que eu construí', en: 'what I built' }),
  opener('stack', { pt: 'stack', en: 'stack' }, { pt: 'tecnologias que eu uso', en: 'technologies I use' }),
  opener('atividade', { pt: 'atividade', en: 'activity' }, { pt: 'atividade no GitHub', en: 'GitHub activity' }),
  opener('curriculo', { pt: 'curriculo', en: 'resume' }, { pt: 'resumo em 1 página', en: 'one-page summary' }, ['cv']),
  opener('contato', { pt: 'contato', en: 'contact' }, { pt: 'onde me encontrar', en: 'where to find me' }),
  {
    names: { pt: 'whoami', en: 'whoami' },
    summary: { pt: 'quem está do outro lado', en: "who's on the other side" },
    run: (_, ctx) => ({ lines: [line(s(profile.name, 'accent'), s(` · ${loc(profile.role, ctx.lang)}`, 'muted'))] }),
  },
  {
    names: { pt: 'echo', en: 'echo' },
    summary: { pt: 'repete o texto', en: 'prints the text' },
    run: (args) => ({ lines: [line(args.join(' '))] }),
  },
  {
    names: { pt: 'lang', en: 'lang' },
    aliases: ['idioma'],
    summary: { pt: 'troca o idioma (pt ou en)', en: 'switches language (pt or en)' },
    run: (args, ctx) => {
      const wanted = args[0] ?? (ctx.lang === 'pt' ? 'en' : 'pt')
      if (!isLang(wanted)) return { lines: [line(s(loc(T.langUsage, ctx.lang), 'warm'))] }
      ctx.setLang(wanted)
      return { lines: [line(s(loc(T.langNow, wanted), 'muted'))] }
    },
  },
  {
    names: { pt: 'history', en: 'history' },
    summary: { pt: 'comandos já digitados', en: 'commands typed so far' },
    run: (_, ctx) => ({
      lines: ctx.cmdHistory.length
        ? ctx.cmdHistory.map((c, i) => line(s(String(i + 1).padStart(4) + '  ', 'muted'), cmd(c)))
        : [line(s(loc(T.historyEmpty, ctx.lang), 'muted'))],
    }),
  },
  {
    names: { pt: 'clear', en: 'clear' },
    aliases: ['cls', 'limpar'],
    summary: { pt: 'limpa o terminal (Ctrl+L)', en: 'clears the terminal (Ctrl+L)' },
    run: () => ({ lines: [], clear: true }),
  },
]

/** Acha um comando por qualquer nome (pt, en ou apelido), sem diferenciar maiúscula. */
export function findCommand(list: readonly Command[], name: string): Command | undefined {
  const n = name.toLowerCase()
  return list.find((c) => c.names.pt === n || c.names.en === n || c.aliases?.includes(n))
}

/** Executa uma linha digitada. */
export function runLine(input: string, ctx: CommandContext, list: readonly Command[] = commands): CommandResult {
  const [name, ...args] = tokenize(input)
  if (name === undefined) return { lines: [] }

  const command = findCommand(list, name)
  if (!command) {
    return {
      lines: [
        line(s(`carvel-sh: ${loc(T.notFound, ctx.lang)}: ${name}`, 'warm')),
        line(s(`${loc(T.tryHelp, ctx.lang)} `, 'muted'), cmd('help')),
      ],
    }
  }
  return command.run(args, ctx)
}
