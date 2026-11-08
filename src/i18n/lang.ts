// i18n em TS puro: nada aqui conhece React, window ou localStorage, então tudo é testável.

export const LANGS = ['pt', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** Um valor com versão nas duas línguas. Faltou uma, o TypeScript reclama. */
export type Localized<T = string> = { pt: T; en: T }

/** Texto que não muda de língua (ex.: 'Java 17') ou que muda ({ pt, en }). */
export type Text = string | Localized

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

/**
 * Escolhe o idioma inicial, nesta ordem:
 * 1. `?lang=` na URL (link para recrutador de fora)
 * 2. a escolha salva da última visita
 * 3. a língua do navegador: português vira `pt`, o resto vira `en`
 */
export function detectLang(input: { query: string | null; saved: string | null; browser: string }): Lang {
  if (isLang(input.query)) return input.query
  if (isLang(input.saved)) return input.saved
  return input.browser.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

function isLocalized<T>(value: Localized<T> | T): value is Localized<T> {
  return typeof value === 'object' && value !== null && 'pt' in value && 'en' in value
}

/** Devolve a versão de `lang`. Valores sem tradução passam direto. */
export function loc<T>(value: Localized<T> | T, lang: Lang): T {
  return isLocalized(value) ? value[lang] : value
}

/** Atalho para texto curto escrito na hora: tr(lang, 'Fechar', 'Close'). */
export function tr(lang: Lang, pt: string, en: string): string {
  return lang === 'en' ? en : pt
}
