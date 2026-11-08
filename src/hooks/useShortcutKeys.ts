import { useEffect } from 'react'
import { isTypingTarget, matchShortcut } from '../core/shortcuts'
import { navigate } from './useHashRoute'

/** Liga as teclas dos atalhos (1 a 4) na página inteira. */
export function useShortcutKeys(shortcuts: readonly { key: string; target: string }[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = matchShortcut(
        { key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, typing: isTypingTarget(document.activeElement) },
        shortcuts,
      )
      if (!target) return
      e.preventDefault()
      navigate(target)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
