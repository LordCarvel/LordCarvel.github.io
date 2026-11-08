import type { Localized } from '../i18n/lang'

/** Textos da moldura do editor (abas, árvore, terminal, barra de status). */
export const frame = {
  root: '~/carvel',
  branch: 'main',
  mode: 'NORMAL',
  prompt: '~ $',
  terminal: 'terminal · carvel-sh',
  hire: { pt: '● disponível para vagas', en: '● open to work' },
  search: { pt: 'buscar', en: 'search' },
  searchAria: { pt: 'Buscar (Ctrl+K)', en: 'Search (Ctrl+K)' },
  langAria: { pt: 'Mudar idioma para inglês', en: 'Switch language to Portuguese' },
  tabsAria: { pt: 'Arquivos abertos', en: 'Open files' },
  treeAria: { pt: 'Arquivos do portfolio', en: 'Portfolio files' },
  close: { pt: 'Fechar', en: 'Close' },
  termPh: { pt: 'digite help (chega no F7)', en: 'type help (coming in F7)' },
  soon: { pt: 'Esta página chega no F5.', en: 'This page arrives in F5.' },
} satisfies Record<string, string | Localized>
