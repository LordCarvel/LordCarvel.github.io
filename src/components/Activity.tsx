import { fallbackRepos, getPushes, getRepos } from '../services/github'
import { useAsync } from '../hooks/useAsync'
import { useEditor } from '../hooks/useEditor'
import { useLang } from '../i18n/useLang'
import { activityLines } from '../pages/atividadeLines'
import Doc from './Doc'

/** atividade.log ao vivo. Se o GitHub falhar, cai nos repositórios de src/data. */
function Activity() {
  const { lang, loc } = useLang()
  const { buffer } = useEditor()
  const repos = useAsync(getRepos)
  const pushes = useAsync(getPushes)

  const now = repos.status !== 'loading' ? repos.now : pushes.status !== 'loading' ? pushes.now : 0

  const lines = activityLines(
    lang,
    {
      repos: repos.status === 'loading' ? 'loading' : repos.status === 'ok' ? repos.data : fallbackRepos,
      pushes: pushes.status === 'loading' ? 'loading' : pushes.status === 'ok' ? pushes.data : 'unavailable',
      now,
    },
    loc(buffer.name),
  )

  return <Doc lines={lines} />
}

export default Activity
