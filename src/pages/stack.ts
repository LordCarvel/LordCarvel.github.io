import { BLANK, line, s, type EditorBuffer, type Line } from '../core/buffer'
import { stack as sections } from '../data/stack'
import { loc } from '../i18n/lang'

// A stack aparece como um arquivo TOML: [seção] e chave = ["valores"].
export const stack: EditorBuffer = {
  id: 'stack',
  name: { pt: 'stack.toml', en: 'stack.toml' },
  title: { pt: 'Stack', en: 'Stack' },
  keywords: sections.flatMap((sec) => sec.entries.flatMap((e) => e.items.map((i) => loc(i, 'en')))).join(' '),
  lines: (lang) =>
    sections.flatMap((sec, i): Line[] => [
      ...(i > 0 ? [BLANK] : []),
      line(s(`[${loc(sec.section, lang)}]`, 'kw')),
      ...sec.entries.map((entry) => {
        const items = entry.items.map((item) => s(`"${loc(item, lang)}"`, 'str'))
        const list = items.flatMap((item, j) => (j > 0 ? [s(', ', 'muted'), item] : [item]))
        return line(s(loc(entry.label, lang), 'key'), s(' = [', 'muted'), ...list, s(']', 'muted'))
      }),
    ]),
}
