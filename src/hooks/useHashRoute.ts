import { useSyncExternalStore } from 'react'
import { toHash } from '../core/router'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getHash() {
  return location.hash
}

/**
 * O hash atual da URL, sempre em dia.
 * useSyncExternalStore é o jeito do React de ler algo que vive fora dele (aqui, a URL):
 * ele assina o evento e re-renderiza quando o valor muda, inclusive no voltar/avançar.
 */
export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, getHash)
}

/** Muda a rota. O hashchange dispara e o useHashRoute avisa todo mundo. */
export function navigate(id: string) {
  location.hash = toHash(id)
}
