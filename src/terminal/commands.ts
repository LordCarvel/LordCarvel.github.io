import { BLANK, cmd, line, s, type Line } from '../core/buffer'
import { profile } from '../data/profile'
import { terminalText as T } from '../data/terminal'
import { themeText } from '../data/themes'
import { THEMES, isTheme } from '../themes'
import { isLang, loc, type Localized } from '../i18n/lang'
import { fsCommands } from './fsCommands'
import { parsePipeline } from './parse'
import { textCommands } from './textCommands'
import { fail, type Command, type CommandContext, type CommandGroup, type CommandResult } from './types'

export type { Command, CommandContext, CommandResult } from './types'

/** Comando que só abre uma página. */
function opener(id: string, names: Localized, summary: Localized, aliases: string[] = []): Command {
  return {
    names,
    aliases,
    group: 'portfolio',
    summary,
    usage: names.pt === names.en ? names.pt : `${names.pt} | ${names.en}`,
    run: (_, ctx) => {
      const buffer = ctx.registry.get(id)
      if (!buffer) return { lines: [] }
      ctx.open(id)
      return { lines: [line(s(`${loc(T.opening, ctx.lang)} `, 'muted'), s(loc(buffer.name, ctx.lang), 'warm'))] }
    },
  }
}

const GROUPS: [CommandGroup, Localized][] = [
  ['files', T.groupFiles],
  ['text', T.groupText],
  ['portfolio', T.groupPortfolio],
  ['system', T.groupSystem],
]

const help: Command = {
  names: { pt: 'help', en: 'help' },
  aliases: ['ajuda', '?'],
  group: 'system',
  summary: { pt: 'lista os comandos', en: 'lists the commands' },
  usage: 'help',
  run: (_, ctx) => {
    const width = Math.max(...commands.map((c) => loc(c.names, ctx.lang).length)) + 2
    const row = (c: Command) => {
      const name = loc(c.names, ctx.lang)
      return line(cmd(name), ' '.repeat(width - name.length), s(loc(c.summary, ctx.lang), 'muted'))
    }
    return {
      lines: [
        line(s(loc(T.helpTitle, ctx.lang), 'comment')),
        ...GROUPS.flatMap(([group, title]): Line[] => [
          BLANK,
          line(s(loc(title, ctx.lang), 'comment')),
          ...commands.filter((c) => c.group === group).map(row),
        ]),
      ],
    }
  },
}

const man: Command = {
  names: { pt: 'man', en: 'man' },
  group: 'system',
  summary: { pt: 'explica um comando', en: 'explains a command' },
  usage: 'man <comando>',
  run: (args, ctx) => {
    const name = args[0]
    if (name === undefined) return fail(ctx, 'man', T.missingOperand)
    const c = findCommand(commands, name)
    if (!c) return { lines: [line(s(`${loc(T.noManual, ctx.lang)} ${name}`, 'warm'))] }
    const aliases = [c.names.pt, c.names.en, ...(c.aliases ?? [])].filter((n, i, all) => all.indexOf(n) === i)
    return {
      lines: [
        line(s(loc(T.manName, ctx.lang), 'key')),
        line(`    ${aliases.join(', ')} — ${loc(c.summary, ctx.lang)}`),
        BLANK,
        line(s(loc(T.manUsage, ctx.lang), 'key')),
        line(s(`    ${c.usage}`, 'str')),
      ],
    }
  },
}

const systemCommands: Command[] = [
  help,
  man,
  {
    names: { pt: 'whoami', en: 'whoami' },
    group: 'system',
    summary: { pt: 'quem está do outro lado', en: "who's on the other side" },
    usage: 'whoami',
    run: (_, ctx) => ({ lines: [line(s(profile.name, 'accent'), s(` · ${loc(profile.role, ctx.lang)}`, 'muted'))] }),
  },
  {
    names: { pt: 'echo', en: 'echo' },
    group: 'system',
    summary: { pt: 'repete o texto', en: 'prints the text' },
    usage: 'echo <texto>',
    run: (args) => ({ lines: [line(args.join(' '))] }),
  },
  {
    names: { pt: 'lang', en: 'lang' },
    aliases: ['idioma'],
    group: 'system',
    summary: { pt: 'troca o idioma (pt ou en)', en: 'switches language (pt or en)' },
    usage: 'lang [pt|en]',
    run: (args, ctx) => {
      const wanted = args[0] ?? (ctx.lang === 'pt' ? 'en' : 'pt')
      if (!isLang(wanted)) return { lines: [line(s(loc(T.langUsage, ctx.lang), 'warm'))] }
      ctx.setLang(wanted)
      return { lines: [line(s(loc(T.langNow, wanted), 'muted'))] }
    },
  },
  {
    names: { pt: 'tema', en: 'theme' },
    group: 'system',
    summary: { pt: 'troca o tema (sem nome, lista os temas)', en: 'switches theme (with no name, lists them)' },
    usage: 'theme [nome]',
    run: (args, ctx) => {
      const wanted = args[0]?.toLowerCase()
      if (wanted === undefined) {
        return {
          lines: [
            line(s(loc(themeText.list, ctx.lang), 'comment')),
            ...THEMES.map((t) =>
              line(
                s(t.id === ctx.theme ? '* ' : '  ', 'accent'),
                cmd(`theme ${t.id}`, t.id),
                s(`  ${loc(t.name, ctx.lang)}`, 'muted'),
              ),
            ),
          ],
        }
      }
      if (!isTheme(wanted)) return fail(ctx, 'theme', themeText.unknown, wanted)
      ctx.setTheme(wanted)
      return { lines: [line(s(`${loc(themeText.set, ctx.lang)}: `, 'muted'), s(wanted, 'accent'))] }
    },
  },
  {
    names: { pt: 'history', en: 'history' },
    group: 'system',
    summary: { pt: 'comandos já digitados', en: 'commands typed so far' },
    usage: 'history',
    run: (_, ctx) => ({
      lines: ctx.cmdHistory.length
        ? ctx.cmdHistory.map((c, i) => line(s(String(i + 1).padStart(4) + '  ', 'muted'), cmd(c)))
        : [line(s(loc(T.historyEmpty, ctx.lang), 'muted'))],
    }),
  },
  {
    names: { pt: 'clear', en: 'clear' },
    aliases: ['cls', 'limpar'],
    group: 'system',
    summary: { pt: 'limpa o terminal (Ctrl+L)', en: 'clears the terminal (Ctrl+L)' },
    usage: 'clear',
    run: () => ({ lines: [], clear: true }),
  },
]

const portfolioCommands: Command[] = [
  opener('perfil', { pt: 'perfil', en: 'home' }, { pt: 'volta para o início', en: 'back to the start' }, ['inicio']),
  opener('sobre', { pt: 'sobre', en: 'about' }, { pt: 'quem eu sou', en: 'who I am' }),
  opener('projetos', { pt: 'projetos', en: 'projects' }, { pt: 'o que eu construí', en: 'what I built' }),
  opener('stack', { pt: 'stack', en: 'stack' }, { pt: 'tecnologias que eu uso', en: 'technologies I use' }),
  opener('atividade', { pt: 'atividade', en: 'activity' }, { pt: 'atividade no GitHub', en: 'GitHub activity' }),
  opener('curriculo', { pt: 'curriculo', en: 'resume' }, { pt: 'resumo em 1 página', en: 'one-page summary' }, ['cv']),
  opener('contato', { pt: 'contato', en: 'contact' }, { pt: 'onde me encontrar', en: 'where to find me' }),
]

export const commands: Command[] = [...fsCommands, ...textCommands, ...portfolioCommands, ...systemCommands]

/** Todos os nomes aceitos (pt, en e apelidos), para o Tab completar. */
export function commandNames(list: readonly Command[] = commands): string[] {
  return [...new Set(list.flatMap((c) => [c.names.pt, c.names.en, ...(c.aliases ?? [])]))]
}

/** Acha um comando por qualquer nome (pt, en ou apelido), sem diferenciar maiúscula. */
export function findCommand(list: readonly Command[], name: string): Command | undefined {
  const n = name.toLowerCase()
  return list.find((c) => c.names.pt === n || c.names.en === n || c.aliases?.includes(n))
}

/**
 * Executa uma linha digitada. Num pipeline, a saída de cada etapa vira o stdin da próxima.
 * `ctx.stdin` é preenchido aqui; quem chama passa null.
 */
export function runLine(input: string, ctx: CommandContext, list: readonly Command[] = commands): CommandResult {
  let stdin: Line[] | null = null
  let clear = false

  for (const [name, ...args] of parsePipeline(input)) {
    const command = findCommand(list, name)
    if (!command) {
      return {
        lines: [
          line(s(`carvel-sh: ${loc(T.notFound, ctx.lang)}: ${name}`, 'warm')),
          line(s(`${loc(T.tryHelp, ctx.lang)} `, 'muted'), cmd('help')),
        ],
      }
    }
    const result = command.run(args, { ...ctx, stdin })
    stdin = result.lines
    clear ||= result.clear === true
  }

  return { lines: stdin ?? [], ...(clear && { clear }) }
}
