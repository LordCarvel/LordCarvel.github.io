import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { detectTheme, isTheme } from '../themes'
import { ThemeContext } from './themeContext'

// A mesma chave que o script do index.html lê antes do React carregar.
const STORAGE_KEY = 'theme'

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function initialTheme(): string {
  return detectTheme({
    saved: readSaved(),
    prefersLight: window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false,
  })
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(initialTheme)
  const [previewing, setPreviewing] = useState<string | null>(null)
  const shown = previewing ?? theme

  // O tema vive no <html data-theme>: o CSS troca as variáveis e tudo muda junto.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = shown
    // A barra do navegador no celular acompanha a cor do painel.
    const panel = getComputedStyle(root).getPropertyValue('--color-panel').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', panel)
  }, [shown])

  const setTheme = useCallback((id: string) => {
    if (!isTheme(id)) return
    setThemeState(id)
    setPreviewing(null)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // sem armazenamento, vale só nesta visita
    }
  }, [])

  const preview = useCallback((id: string | null) => setPreviewing(id !== null && isTheme(id) ? id : null), [])

  const value = useMemo(() => ({ theme, shown, setTheme, preview }), [theme, shown, setTheme, preview])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
