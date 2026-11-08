import type { Localized } from '../i18n/lang'

export type Shortcut = {
  /** Tecla que abre o atalho (fora de campo de texto). */
  key: string
  /** Id do buffer de destino. */
  target: string
  title: Localized
  desc: Localized
}

// O atalho 2 aponta para a stack até o comparador de vaga existir (F10).
export const shortcuts: Shortcut[] = [
  {
    key: '1',
    target: 'projetos',
    title: { pt: 'Ver projetos', en: 'See projects' },
    desc: { pt: 'o que eu construí e por quê', en: 'what I built and why' },
  },
  {
    key: '2',
    target: 'stack',
    title: { pt: 'Tecnologias', en: 'Tech stack' },
    desc: { pt: 'o que eu uso no dia a dia', en: 'what I use every day' },
  },
  {
    key: '3',
    target: 'curriculo',
    title: { pt: 'Resumo em 1 página', en: 'One-page summary' },
    desc: { pt: 'para ler rápido', en: 'for a quick read' },
  },
  {
    key: '4',
    target: 'contato',
    title: { pt: 'Contato', en: 'Contact' },
    desc: { pt: 'onde me encontrar', en: 'where to find me' },
  },
]

export const home = {
  shortcutsAria: { pt: 'Atalhos', en: 'Shortcuts' },
  startHere: { pt: '## Por onde começar', en: '## Where to start' },
  preferTyping: {
    pt: '// prefere digitar? o terminal aqui embaixo entende comandos:',
    en: '// prefer typing? the terminal below understands commands:',
  },
  keysHint: {
    pt: '// 1 a 4 abrem os atalhos · : ou / foca o terminal',
    en: '// 1 to 4 open the shortcuts · : or / focuses the terminal',
  },
} satisfies Record<string, Localized>
