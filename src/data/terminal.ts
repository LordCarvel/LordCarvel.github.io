import type { Localized } from '../i18n/lang'

export const terminalText = {
  welcome: { pt: 'carvel-sh · digite um comando ou clique em um abaixo:', en: 'carvel-sh · type a command or click one below:' },
  notFound: { pt: 'comando não encontrado', en: 'command not found' },
  tryHelp: { pt: 'veja os comandos com', en: 'see the commands with' },
  opening: { pt: 'abrindo', en: 'opening' },
  helpTitle: { pt: '# comandos (também dá para clicar)', en: '# commands (you can click them too)' },
  langNow: { pt: 'idioma: português', en: 'language: English' },
  langUsage: { pt: 'uso: lang [pt|en]', en: 'usage: lang [pt|en]' },
  historyEmpty: { pt: 'histórico vazio', en: 'history is empty' },
  chipsAria: { pt: 'Comandos sugeridos', en: 'Suggested commands' },
} satisfies Record<string, Localized>

/** Comandos que aparecem como botões embaixo do terminal. */
export const chips: Localized<string[]> = {
  pt: ['help', 'sobre', 'projetos', 'stack', 'contato', 'clear'],
  en: ['help', 'about', 'projects', 'stack', 'contact', 'clear'],
}
