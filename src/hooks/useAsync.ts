import { useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T; now: number }
  | { status: 'error'; error: unknown; now: number }

/**
 * Roda uma função assíncrona ao montar e guarda o resultado.
 * `load` precisa ser estável (uma função de módulo, como getRepos), senão roda a cada render.
 * `now` é o horário da resposta: o "há 3 dias" usa ele, e a renderização continua pura.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })

  useEffect(() => {
    let alive = true // a página pode ser fechada antes da resposta chegar
    load().then(
      (data) => alive && setState({ status: 'ok', data, now: Date.now() }),
      (error: unknown) => alive && setState({ status: 'error', error, now: Date.now() }),
    )
    return () => {
      alive = false
    }
  }, [load])

  return state
}
