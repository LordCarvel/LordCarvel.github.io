import type { Localized } from '../i18n/lang'

export const themeText = {
  title: { pt: 'Temas', en: 'Themes' },
  hint: { pt: '↑ ↓ mostra · Enter escolhe · Esc volta', en: '↑ ↓ previews · Enter picks · Esc goes back' },
  current: { pt: 'atual', en: 'current' },
  statusAria: { pt: 'Trocar tema (T)', en: 'Change theme (T)' },
  set: { pt: 'tema', en: 'theme' },
  unknown: { pt: 'tema desconhecido', en: 'unknown theme' },
  list: { pt: '# temas (clique para trocar) · tecla T abre o seletor', en: '# themes (click to switch) · press T to open the picker' },
} satisfies Record<string, Localized>
