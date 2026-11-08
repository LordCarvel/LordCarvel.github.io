import { toHash } from '../core/router'
import { home, shortcuts } from '../data/home'
import { useLang } from '../i18n/useLang'
import { introLines, outroLines } from '../pages/perfilLines'
import Doc from './Doc'

/** Página inicial: o texto do perfil com os 4 atalhos em cartões no meio. */
function Home() {
  const { lang, loc } = useLang()

  return (
    <>
      <Doc lines={introLines(lang)} />

      {/* Os cartões ocupam o lugar das linhas de texto dos atalhos, então
          o contador pula a mesma quantidade e a numeração continua certa. */}
      <nav
        aria-label={loc(home.shortcutsAria)}
        style={{ counterIncrement: `ln ${shortcuts.length}` }}
        className="doc-indent my-2 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.25"
      >
        {shortcuts.map((sc) => (
          <a
            key={sc.key}
            href={toHash(sc.target)}
            className="grid grid-cols-[auto_1fr] gap-x-3 rounded-[9px] border border-line bg-panel-2 px-3.5 py-3 text-fg transition hover:-translate-y-0.5 hover:border-accent hover:bg-hl hover:no-underline motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <kbd className="row-span-2 mt-0.75 self-start">{sc.key}</kbd>
            <b className="text-accent">{loc(sc.title)}</b>
            <span className="text-[0.86em] text-muted">{loc(sc.desc)}</span>
          </a>
        ))}
      </nav>

      <Doc lines={outroLines(lang)} />
    </>
  )
}

export default Home
