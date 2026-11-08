import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { detectLang, loc, tr, type Lang, type Localized } from '../i18n/lang'
import { LangContext } from '../i18n/langContext'

const STORAGE_KEY = 'lang'

// localStorage pode lançar erro (aba anônima, cookies bloqueados): o site segue sem ele.
function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function save(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // sem armazenamento, a escolha vale só nesta visita
  }
}

function initialLang(): Lang {
  return detectLang({
    query: new URLSearchParams(location.search).get('lang'),
    saved: readSaved(),
    browser: navigator.language ?? 'pt',
  })
}

function LangProvider({ children }: { children: ReactNode }) {
  // Função no useState: só roda na primeira renderização.
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    save(next)

    // Se o link veio com ?lang=, mantém a URL coerente com a escolha.
    const url = new URL(location.href)
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next)
      history.replaceState(null, '', url)
    }
  }, [])

  // <html lang> certo ajuda leitor de tela e tradutor automático.
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      loc: <T,>(v: Localized<T> | T) => loc(v, lang),
      tr: (pt: string, en: string) => tr(lang, pt, en),
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export default LangProvider
