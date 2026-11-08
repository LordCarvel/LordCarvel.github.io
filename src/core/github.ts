// Lógica pura dos dados do GitHub: transforma o JSON da API em tipos nossos e calcula
// o gráfico. Nada aqui faz fetch nem lê o relógio sozinho: o `now` sempre vem de fora.
import type { Lang } from '../i18n/lang'

export type Repo = {
  name: string
  url: string
  language: string | null
  /** ISO 8601. null no plano B (sem API). */
  pushedAt: string | null
}

export type Push = {
  /** Só o nome do repositório, sem o dono. */
  repo: string
  branch: string
  /** ISO 8601 */
  at: string
}

const DAY = 86_400_000

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Repositórios próprios (sem forks), do push mais recente para o mais antigo. */
export function parseRepos(raw: unknown): Repo[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(isObject)
    .filter((r) => typeof r.name === 'string' && r.fork !== true)
    .map((r) => ({
      name: r.name as string,
      url: typeof r.html_url === 'string' ? r.html_url : '',
      language: typeof r.language === 'string' ? r.language : null,
      pushedAt: typeof r.pushed_at === 'string' ? r.pushed_at : null,
    }))
    .sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? ''))
}

/**
 * Só os eventos de push. A API pública não manda mais a lista de commits
 * de cada push, então contamos pushes, não commits.
 */
export function parsePushes(raw: unknown): Push[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(isObject)
    .flatMap((e) => {
      if (e.type !== 'PushEvent' || typeof e.created_at !== 'string') return []
      const repoName = isObject(e.repo) && typeof e.repo.name === 'string' ? e.repo.name : ''
      const ref = isObject(e.payload) && typeof e.payload.ref === 'string' ? e.payload.ref : ''
      return [{ repo: repoName.split('/').pop() ?? repoName, branch: ref.replace('refs/heads/', ''), at: e.created_at }]
    })
    .sort((a, b) => b.at.localeCompare(a.at)) // a API não garante a ordem
}

function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Pushes por dia nos últimos `days` dias (fuso local). O último item é hoje. */
export function dailyCounts(pushes: readonly Push[], now: number, days = 30): number[] {
  const counts = Array<number>(days).fill(0)
  const today = startOfDay(now)
  for (const p of pushes) {
    // round em vez de floor: dia com horário de verão tem 23 ou 25 horas.
    const ago = Math.round((today - startOfDay(Date.parse(p.at))) / DAY)
    if (ago >= 0 && ago < days) counts[days - 1 - ago]++
  }
  return counts
}

const BARS = '▁▂▃▄▅▆▇█'

/** Gráfico em texto: um caractere por dia, · nos dias sem push. */
export function sparkline(counts: readonly number[]): string {
  const max = Math.max(1, ...counts)
  return counts.map((n) => (n === 0 ? '·' : BARS[Math.ceil((n / max) * BARS.length) - 1])).join('')
}

/** "há 3 dias" / "3 days ago". */
export function relTime(iso: string | null, now: number, lang: Lang): string {
  if (!iso) return ''
  const days = Math.floor((now - Date.parse(iso)) / DAY)
  const pt = lang === 'pt'
  if (days <= 0) return pt ? 'hoje' : 'today'
  if (days === 1) return pt ? 'ontem' : 'yesterday'
  if (days < 30) return pt ? `há ${days} dias` : `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return pt ? `há ${months} ${months === 1 ? 'mês' : 'meses'}` : `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return pt ? `há ${years} ${years === 1 ? 'ano' : 'anos'}` : `${years} year${years === 1 ? '' : 's'} ago`
}
