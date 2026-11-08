import { BLANK, a, line, s, type EditorBuffer } from '../core/buffer'
import { profile } from '../data/profile'
import { loc } from '../i18n/lang'

const intro = { pt: '# onde me encontrar', en: '# where to find me' }

// Só os links que existem em data/profile.ts aparecem (regra: campo vazio some).
export const contato: EditorBuffer = {
  id: 'contato',
  name: { pt: 'contato.sh', en: 'contact.sh' },
  title: { pt: 'Contato', en: 'Contact' },
  keywords: 'email linkedin github',
  lines: (lang) => {
    const { github, email, linkedin } = profile.links
    const entries: [string, string, string][] = [
      ['github', github.replace('https://', ''), github],
      ...(email ? [['email', email, `mailto:${email}`] as [string, string, string]] : []),
      ...(linkedin ? [['linkedin', linkedin.replace('https://', ''), linkedin] as [string, string, string]] : []),
    ]

    return [
      line(s('#!/bin/sh', 'comment')),
      line(s(loc(intro, lang), 'comment')),
      BLANK,
      ...entries.map(([key, text, href]) => line(s(key, 'prop'), s('="', 'muted'), a(text, href), s('"', 'muted'))),
    ]
  },
}
