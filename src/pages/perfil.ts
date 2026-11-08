import { BLANK, a, line, s, type EditorBuffer } from '../core/buffer'
import { profile } from '../data/profile'
import { loc } from '../i18n/lang'

export const perfil: EditorBuffer = {
  id: 'perfil',
  name: { pt: 'perfil.md', en: 'profile.md' },
  title: { pt: 'Perfil', en: 'Profile' },
  keywords: 'carvel java backend',
  lines: (lang) => [
    line(s(`# ${profile.name}`, 'title')),
    line(s(loc(profile.role, lang), 'warm')),
    BLANK,
    line(loc(profile.tagline, lang)),
    BLANK,
    line(s('> ', 'muted'), s(loc(profile.lookingFor, lang), 'accent')),
    line(s('@ ', 'muted'), s(loc(profile.location, lang), 'muted')),
    BLANK,
    line(s('github', 'key'), ': ', a(profile.links.github.replace('https://', ''), profile.links.github)),
  ],
}
