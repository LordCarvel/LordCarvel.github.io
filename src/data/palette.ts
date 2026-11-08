import type { Localized } from '../i18n/lang'

export const paletteText = {
  aria: { pt: 'Busca rápida', en: 'Quick search' },
  placeholder: { pt: 'buscar páginas, projetos, comandos…', en: 'search pages, projects, commands…' },
  results: { pt: 'Resultados', en: 'Results' },
  empty: { pt: 'nada encontrado', en: 'nothing found' },
  page: { pt: 'página', en: 'page' },
  command: { pt: 'comando', en: 'command' },
  hint: { pt: '↑ ↓ escolhe · Enter abre · Esc fecha', en: '↑ ↓ choose · Enter opens · Esc closes' },
} satisfies Record<string, Localized>
