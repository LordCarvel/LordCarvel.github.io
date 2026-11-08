import { BLANK, line, s, type EditorBuffer } from '../core/buffer'
import { profile } from '../data/profile'
import { loc } from '../i18n/lang'

const title = { pt: 'Sobre', en: 'About' }

export const sobre: EditorBuffer = {
  id: 'sobre',
  name: { pt: 'sobre.md', en: 'about.md' },
  title,
  lines: (lang) => [line(s(`# ${loc(title, lang)}`, 'title')), BLANK, ...loc(profile.about, lang).map((p) => line(p))],
}
