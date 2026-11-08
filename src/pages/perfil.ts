import type { EditorBuffer } from '../core/buffer'
import Home from '../components/Home'
import { introLines, outroLines, shortcutLines } from './perfilLines'

export const perfil: EditorBuffer = {
  id: 'perfil',
  name: { pt: 'perfil.md', en: 'profile.md' },
  title: { pt: 'Início', en: 'Home' },
  keywords: 'home inicio perfil profile carvel java backend',
  lines: (lang) => [...introLines(lang), ...shortcutLines(lang), ...outroLines(lang)],
  Component: Home,
}
