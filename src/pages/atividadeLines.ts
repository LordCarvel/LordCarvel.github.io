import { BLANK, a, line, s, type Line } from '../core/buffer'
import { dailyCounts, relTime, sparkline, type Push, type Repo } from '../core/github'
import { toHash } from '../core/router'
import { activity, DASHBOARD_URL } from '../data/activity'
import { profile } from '../data/profile'
import { loc, type Lang } from '../i18n/lang'

/**
 * O que já se sabe do GitHub. As mesmas funções desenham a página ao vivo
 * e a versão estática do lines() (cat/grep), que é o caso "sem dados".
 */
export type GithubData = {
  pushes: Push[] | 'loading' | 'unavailable'
  /** Sem a API, quem chama passa os repositórios do plano B. */
  repos: Repo[] | 'loading'
  /** Horário de referência para o "há 3 dias". */
  now: number
}

export function activityLines(lang: Lang, d: GithubData, title: string): Line[] {
  const L = (v: { pt: string; en: string }) => loc(v, lang)

  let chart: Line[]
  let pushLines: Line[]
  if (d.pushes === 'loading') {
    chart = [line(s(L(activity.loading), 'muted'))]
    pushLines = []
  } else if (d.pushes === 'unavailable') {
    chart = [line(s(L(activity.unavailable), 'warm'))]
    pushLines = []
  } else {
    const counts = dailyCounts(d.pushes, d.now)
    const active = counts.filter((n) => n > 0).length
    chart = [line(s(sparkline(counts), 'accent'), s(`  ${L(activity.last30)} · ${active} ${L(activity.daysWithPush)}`, 'muted'))]
    pushLines =
      d.pushes.length === 0
        ? [line(s(L(activity.noPushes), 'muted'))]
        : d.pushes
            .slice(0, 12)
            .map((p) =>
              line(s(relTime(p.at, d.now, lang).padEnd(12), 'muted'), s('push ', 'accent'), s(p.repo, 'warm'), s(` → ${p.branch}`, 'muted')),
            )
  }

  const repoLines: Line[] =
    d.repos === 'loading'
      ? [line(s(L(activity.loading), 'muted'))]
      : d.repos
          .slice(0, 8)
          .map((r) =>
            line(s(relTime(r.pushedAt, d.now, lang).padEnd(12), 'muted'), a(r.name, r.url), s(r.language ? `  ${r.language}` : '', 'muted')),
          )

  return [
    line(s(`# ${title}`, 'title')),
    line(s(L(activity.live), 'comment')),
    BLANK,
    ...chart,
    ...(pushLines.length ? [BLANK, line(s(L(activity.recentPushes), 'comment')), ...pushLines] : []),
    BLANK,
    line(s(L(activity.reposByPush), 'comment')),
    ...repoLines,
    BLANK,
    line(s(`${L(activity.dashboard)}: `, 'muted'), a(DASHBOARD_URL.replace('https://', ''), DASHBOARD_URL)),
  ]
}

/** A linha de números do GitHub no perfil. */
export function statsLine(lang: Lang, repos: Repo[] | 'loading' | 'unavailable', now: number): Line {
  const L = (v: { pt: string; en: string }) => loc(v, lang)
  const github = a(`github.com/${profile.githubUser}`, profile.links.github)

  if (repos === 'loading') return line(s(L(activity.loading), 'muted'))
  if (repos === 'unavailable' || repos.length === 0) return line(github)

  const last = repos[0]
  return line(
    s(`${repos.length} ${L(activity.publicRepos)}`, 'accent'),
    s(` · ${L(activity.lastPush)} ${relTime(last.pushedAt, now, lang)} ${L(activity.in)} `, 'muted'),
    a(last.name, toHash('atividade')),
  )
}
