import type { EditorBuffer } from '../core/buffer'
import Activity from '../components/Activity'
import { fallbackRepos } from '../services/github'
import { activityLines } from './atividadeLines'

const name = { pt: 'atividade.log', en: 'activity.log' }

export const atividade: EditorBuffer = {
  id: 'atividade',
  name,
  title: { pt: 'Atividade no GitHub', en: 'GitHub activity' },
  keywords: 'activity atividade commits push github log',
  // Versão estática (cat/grep): sem a API, mostra os repositórios do plano B.
  lines: (lang) =>
    activityLines(lang, { repos: fallbackRepos, pushes: 'unavailable', now: 0 }, name[lang]),
  Component: Activity,
}
