import { BLANK, a, line, s, type Line } from '../core/buffer'
import { toHash } from '../core/router'
import { home, shortcuts } from '../data/home'
import { profile } from '../data/profile'
import { loc, type Lang } from '../i18n/lang'

// O perfil é dividido em três partes porque, na tela, os atalhos viram cartões
// no meio do texto. O lines() do buffer junta as três: é o que cat e grep vão ler.

export function introLines(lang: Lang): Line[] {
  return [
    line(s(`# ${profile.name.toUpperCase()}`, 'title')),
    line(s(loc(profile.role, lang), 'warm')),
    line(s(loc(profile.tagline, lang), 'muted')),
    BLANK,
    line(s('● ', 'accent'), loc(profile.lookingFor, lang), s(` · ${loc(profile.location, lang)}`, 'muted')),
  ]
}

// Entre o intro e o "Por onde começar" fica a linha do GitHub (statsLine), ao vivo na tela.

export function startLines(lang: Lang): Line[] {
  return [BLANK, line(s(loc(home.startHere, lang), 'comment'))]
}

/** Versão em texto dos cartões: uma linha por atalho. */
export function shortcutLines(lang: Lang): Line[] {
  return shortcuts.map((sc) =>
    line(s(`[${sc.key}] `, 'muted'), a(loc(sc.title, lang), toHash(sc.target)), s(` — ${loc(sc.desc, lang)}`, 'muted')),
  )
}

export function outroLines(lang: Lang): Line[] {
  return [BLANK, line(s(loc(home.keysHint, lang), 'comment'))]
}
