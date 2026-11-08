import type { Localized } from '../i18n/lang'

export const activity = {
  live: { pt: '// ao vivo, direto da API pública do GitHub', en: '// live, straight from the public GitHub API' },
  loading: { pt: 'consultando o GitHub…', en: 'checking GitHub…' },
  unavailable: {
    pt: 'o GitHub não respondeu agora (sem internet ou limite de acesso); mostrando o que está salvo no site',
    en: "GitHub didn't answer right now (offline or rate limited); showing what is stored on the site",
  },
  last30: { pt: 'últimos 30 dias', en: 'last 30 days' },
  daysWithPush: { pt: 'dias com push', en: 'days with pushes' },
  recentPushes: { pt: '## pushes recentes', en: '## recent pushes' },
  noPushes: { pt: 'sem pushes públicos recentes', en: 'no recent public pushes' },
  reposByPush: { pt: '## repositórios por último push', en: '## repositories by last push' },
  dashboard: { pt: 'painel completo por período', en: 'full dashboard by period' },
  publicRepos: { pt: 'repositórios públicos', en: 'public repositories' },
  lastPush: { pt: 'último push', en: 'last push' },
  in: { pt: 'em', en: 'in' },
} satisfies Record<string, Localized>

export const DASHBOARD_URL = 'https://lordcarvel.github.io/LordCarvel/#activity'
