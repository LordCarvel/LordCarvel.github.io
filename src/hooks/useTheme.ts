import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '../context/themeContext'

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme() precisa estar dentro de <ThemeProvider>')
  return value
}
