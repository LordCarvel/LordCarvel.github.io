import { useContext } from 'react'
import { LangContext, type LangContextValue } from './langContext'

export function useLang(): LangContextValue {
  const value = useContext(LangContext)
  if (!value) throw new Error('useLang() precisa estar dentro de <LangProvider>')
  return value
}
