import type { Localized } from '../i18n/lang'

/** Textos da moldura do editor (abas, árvore, terminal, barra de status). */
export const frame = {
  root: '~/carvel',
  branch: 'main',
  mode: 'NORMAL',
  terminal: 'terminal · carvel-sh',
  hire: { pt: '● disponível para vagas', en: '● open to work' },
  search: { pt: 'buscar', en: 'search' },
  searchAria: { pt: 'Buscar (Ctrl+K)', en: 'Search (Ctrl+K)' },
  langAria: { pt: 'Mudar idioma para inglês', en: 'Switch language to Portuguese' },
  tabsAria: { pt: 'Arquivos abertos', en: 'Open files' },
  treeAria: { pt: 'Arquivos do portfolio', en: 'Portfolio files' },
  close: { pt: 'Fechar', en: 'Close' },
  termPh: { pt: 'digite help ou clique abaixo', en: 'type help or click below' },
} satisfies Record<string, string | Localized>
