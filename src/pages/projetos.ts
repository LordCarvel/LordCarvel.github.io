import { BLANK, a, line, s, type EditorBuffer, type Line } from '../core/buffer'
import { toHash } from '../core/router'
import { profile } from '../data/profile'
import { projects, type Project } from '../data/projects'
import { loc } from '../i18n/lang'

const title = { pt: 'Projetos', en: 'Projects' }
const labels = {
  repo: { pt: 'repositório', en: 'repository' },
  demo: { pt: 'demo', en: 'demo' },
}

/** A pasta projetos/ e a página de índice dela. */
export const projetos: EditorBuffer = {
  id: 'projetos',
  name: { pt: 'projetos/', en: 'projects/' },
  title,
  isDir: true,
  lines: (lang) => [
    line(s(`# ${loc(title, lang)}`, 'title')),
    ...projects.flatMap((p): Line[] => [
      BLANK,
      line(s('## ', 'muted'), a(p.title, toHash(p.slug)), p.featured ? s(' ★', 'warm') : ''),
      line(s(loc(p.pitch, lang), 'muted')),
    ]),
  ],
}

function projectPage(p: Project): EditorBuffer {
  const repoUrl = `${profile.links.github}/${p.repo}`

  return {
    id: p.slug,
    name: { pt: p.file, en: p.file },
    title: { pt: p.title, en: p.title },
    dir: 'projetos',
    keywords: [p.repo, ...p.tech].join(' '),
    lines: (lang) => [
      line(s(`// ${loc(p.kicker, lang)}`, 'comment')),
      line(s(`# ${p.title}`, 'title')),
      BLANK,
      line(loc(p.pitch, lang)),
      BLANK,
      ...loc(p.points, lang).map((point) => line(s('- ', 'accent'), point)),
      BLANK,
      line(s('tech', 'key'), s(' = ', 'muted'), s(p.tech.join(' · '), 'str')),
      line(s(loc(labels.repo, lang), 'key'), s(' = ', 'muted'), a(repoUrl.replace('https://', ''), repoUrl)),
      ...(p.demo ? [line(s(loc(labels.demo, lang), 'key'), s(' = ', 'muted'), a(p.demo.replace('https://', ''), p.demo))] : []),
    ],
  }
}

/** Uma página por projeto: adicionar em data/projects.ts basta. */
export const projectPages: EditorBuffer[] = projects.map(projectPage)
