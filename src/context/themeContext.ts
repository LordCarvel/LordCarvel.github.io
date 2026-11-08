import { createContext } from 'react'

export type ThemeContextValue = {
  /** Tema escolhido (e salvo). */
  theme: string
  /** O que está na tela agora: a prévia, se houver, ou o escolhido. */
  shown: string
  /** Escolhe e salva. */
  setTheme: (id: string) => void
  /** Mostra um tema sem salvar (seletor com prévia). null volta ao escolhido. */
  preview: (id: string | null) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
