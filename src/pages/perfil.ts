import type { EditorBuffer } from '../core/buffer'
import Home from '../components/Home'
import { statsLine } from './atividadeLines'
import { introLines, outroLines, shortcutLines, startLines } from './perfilLines'

export const perfil: EditorBuffer = {
  id: 'perfil',
  name: { pt: 'perfil.md', en: 'profile.md' },
  title: { pt: 'Início', en: 'Home' },
  keywords: 'home inicio perfil profile carvel java backend',
  // Versão em texto: sem a API, a linha do GitHub vira só o link do perfil.
  lines: (lang) => [
    ...introLines(lang),
    statsLine(lang, 'unavailable', 0),
    ...startLines(lang),
    ...shortcutLines(lang),
    ...outroLines(lang),
  ],
  Component: Home,
}
