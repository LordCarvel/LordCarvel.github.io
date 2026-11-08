import { createContext } from 'react'
import type { Lang, Localized } from './lang'

export type LangContextValue = {
  lang: Lang
  setLang: (next: Lang) => void
  /** loc() já com o idioma atual. */
  loc: <T>(value: Localized<T> | T) => T
  /** tr() já com o idioma atual. */
  tr: (pt: string, en: string) => string
}

// Fica num arquivo próprio porque o React Fast Refresh só recarrega bem
// arquivos que exportam apenas componentes (regra react-refresh do ESLint).
export const LangContext = createContext<LangContextValue | null>(null)
