import type { Localized } from '../i18n/lang'

export type Theme = {
  /** Igual ao valor de data-theme no CSS. */
  id: string
  name: Localized
  dark: boolean
}

// As cores de cada tema ficam no CSS (src/index.css), em [data-theme="id"].
// Aqui só o que a interface precisa saber: nome e se é escuro.
export const THEMES: Theme[] = [
  { id: 'workspace', name: { pt: 'Workspace', en: 'Workspace' }, dark: true },
  { id: 'workspace-light', name: { pt: 'Workspace claro', en: 'Workspace Light' }, dark: false },
  { id: 'tokyo-night', name: { pt: 'Tokyo Night', en: 'Tokyo Night' }, dark: true },
  { id: 'gruvbox-dark', name: { pt: 'Gruvbox', en: 'Gruvbox' }, dark: true },
]

export const DEFAULT_THEME = 'workspace'
export const LIGHT_THEME = 'workspace-light'

export function isTheme(id: unknown): id is string {
  return typeof id === 'string' && THEMES.some((t) => t.id === id)
}

/** Tema inicial: o salvo da última visita; senão, claro se o sistema estiver no modo claro. */
export function detectTheme(input: { saved: string | null; prefersLight: boolean }): string {
  if (isTheme(input.saved)) return input.saved
  return input.prefersLight ? LIGHT_THEME : DEFAULT_THEME
}

/** Próximo tema da lista (dá a volta), para as setas do seletor. */
export function stepTheme(id: string, step: 1 | -1): string {
  const i = THEMES.findIndex((t) => t.id === id)
  return THEMES[(i + step + THEMES.length) % THEMES.length].id
}
