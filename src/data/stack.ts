import type { Localized, Text } from '../i18n/lang'

export type StackEntry = {
  label: Localized
  /** Nome de tecnologia fica como string; palavra que traduz vira { pt, en }. */
  items: Text[]
}

export type StackSection = {
  section: Text
  entries: StackEntry[]
}

export const stack: StackSection[] = [
  {
    section: 'backend',
    entries: [
      { label: { pt: 'linguagens', en: 'languages' }, items: ['Java 17', 'Node.js'] },
      { label: { pt: 'dados', en: 'data' }, items: ['JDBC', 'SQL', 'H2', 'SQLite'] },
      {
        label: { pt: 'fundamentos', en: 'fundamentals' },
        items: ['OOP', 'generics', { pt: 'reflexão', en: 'reflection' }],
      },
    ],
  },
  {
    section: 'web.desktop',
    entries: [
      { label: { pt: 'interface', en: 'ui' }, items: ['React', 'TypeScript', 'Tailwind CSS'] },
      { label: { pt: 'plataforma', en: 'platform' }, items: ['Electron', 'Vite'] },
      { label: { pt: 'base', en: 'base' }, items: ['HTML', 'CSS', 'JavaScript'] },
    ],
  },
  {
    section: { pt: 'qualidade', en: 'quality' },
    entries: [
      { label: { pt: 'testes', en: 'tests' }, items: ['JUnit', 'H2', 'Vitest'] },
      { label: { pt: 'build', en: 'build' }, items: ['Maven', 'JaCoCo'] },
    ],
  },
  {
    section: { pt: 'ferramentas', en: 'tools' },
    entries: [
      { label: { pt: 'versão', en: 'vcs' }, items: ['Git', 'GitHub'] },
      { label: { pt: 'rotina', en: 'daily' }, items: ['Actions', 'Neovim'] },
    ],
  },
]
