import { BLANK, a, line, s, type EditorBuffer, type Line } from '../core/buffer'
import { toHash } from '../core/router'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import { stack } from '../data/stack'
import { loc } from '../i18n/lang'

const labels = {
  summary: { pt: '## Resumo', en: '## Summary' },
  stack: { pt: '## Tecnologias', en: '## Tech stack' },
  projects: { pt: '## Projetos', en: '## Projects' },
  links: { pt: '## Links', en: '## Links' },
  pdf: { pt: 'baixar PDF', en: 'download PDF' },
}

// Resumo de uma página montado só com os dados que já existem: muda junto com eles.
export const curriculo: EditorBuffer = {
  id: 'curriculo',
  name: { pt: 'curriculo.txt', en: 'resume.txt' },
  title: { pt: 'Currículo', en: 'Resume' },
  keywords: 'curriculo resume cv pdf resumo',
  lines: (lang) => {
    const { github, email, linkedin, cv } = profile.links
    const links: Line[] = [
      line(s('github   ', 'prop'), a(github.replace('https://', ''), github)),
      ...(email ? [line(s('email    ', 'prop'), a(email, `mailto:${email}`))] : []),
      ...(linkedin ? [line(s('linkedin ', 'prop'), a(linkedin.replace(/^https:\/\/(www\.)?/, ''), linkedin))] : []),
      ...(cv ? [line(s('pdf      ', 'prop'), a(loc(labels.pdf, lang), cv))] : []),
    ]

    return [
      line(s(`# ${profile.name}`, 'title'), s(` — ${loc(profile.role, lang)}`, 'warm')),
      line(s(`${loc(profile.location, lang)} · ${loc(profile.lookingFor, lang)}`, 'muted')),
      BLANK,
      line(s(loc(labels.summary, lang), 'comment')),
      line(loc(profile.tagline, lang)),
      line(loc(profile.about, lang)[0]),
      BLANK,
      line(s(loc(labels.stack, lang), 'comment')),
      ...stack.map((sec) =>
        line(
          s(`${loc(sec.section, lang)}: `, 'key'),
          sec.entries.flatMap((e) => e.items.map((i) => loc(i, lang))).join(', '),
        ),
      ),
      BLANK,
      line(s(loc(labels.projects, lang), 'comment')),
      ...projects.map((p) => line(s('- ', 'accent'), a(p.title, toHash(p.slug)), s(` — ${loc(p.pitch, lang)}`, 'muted'))),
      BLANK,
      line(s(loc(labels.links, lang), 'comment')),
      ...links,
    ]
  },
}
