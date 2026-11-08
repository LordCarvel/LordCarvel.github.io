import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Registry } from '../core/registry'
import { resolveRoute } from '../core/router'
import { closeTab, openTab } from '../core/tabs'
import { navigate, useHashRoute } from '../hooks/useHashRoute'
import { EditorContext } from './editorContext'

type Props = {
  registry: Registry
  /** Página aberta quando a URL não tem rota (ou tem uma que não existe). */
  home: string
  children: ReactNode
}

/**
 * A URL é a fonte da verdade do buffer aberto: clicar num link muda o hash,
 * o hash muda o buffer. Por isso voltar/avançar e links diretos funcionam sozinhos.
 */
function EditorProvider({ registry, home, children }: Props) {
  const hash = useHashRoute()
  const current = resolveRoute(hash, registry.has, home)

  const [tabs, setTabs] = useState<string[]>([current])

  // Quando a rota muda, a página nova ganha aba. Isto é o padrão do React para
  // "ajustar estado quando uma entrada muda": comparar com o valor anterior durante
  // a renderização, em vez de um useEffect (que renderizaria duas vezes).
  const [lastRoute, setLastRoute] = useState(current)
  if (lastRoute !== current) {
    setLastRoute(current)
    setTabs((t) => openTab(t, current))
  }

  const close = useCallback(
    (id: string) => {
      const next = closeTab(tabs, id, current)
      setTabs(next.tabs)
      if (next.current !== current) navigate(next.current)
    },
    [tabs, current],
  )

  const value = useMemo(
    () => ({ registry, buffer: registry.get(current)!, tabs, open: navigate, close }),
    [registry, current, tabs, close],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export default EditorProvider
