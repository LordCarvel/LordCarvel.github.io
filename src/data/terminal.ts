import type { Localized } from '../i18n/lang'

export const terminalText = {
  welcome: { pt: 'carvel-sh · digite um comando ou clique em um abaixo:', en: 'carvel-sh · type a command or click one below:' },
  notFound: { pt: 'comando não encontrado', en: 'command not found' },
  tryHelp: { pt: 'veja os comandos com', en: 'see the commands with' },
  opening: { pt: 'abrindo', en: 'opening' },
  helpTitle: { pt: '# comandos (também dá para clicar) · man <comando> explica cada um', en: '# commands (click them too) · man <command> explains each one' },
  langNow: { pt: 'idioma: português', en: 'language: English' },
  langUsage: { pt: 'uso: lang [pt|en]', en: 'usage: lang [pt|en]' },
  historyEmpty: { pt: 'histórico vazio', en: 'history is empty' },
  chipsAria: { pt: 'Comandos sugeridos', en: 'Suggested commands' },

  noSuchFile: { pt: 'arquivo ou diretório não encontrado', en: 'no such file or directory' },
  notDir: { pt: 'não é um diretório', en: 'not a directory' },
  isDir: { pt: 'é um diretório', en: 'is a directory' },
  missingOperand: { pt: 'falta o argumento', en: 'missing operand' },
  noInput: { pt: 'sem entrada: passe um arquivo ou use depois de um |', en: 'no input: pass a file or use it after a |' },
  noManual: { pt: 'sem manual para', en: 'no manual entry for' },
  manName: { pt: 'NOME', en: 'NAME' },
  manUsage: { pt: 'USO', en: 'USAGE' },

  groupFiles: { pt: '## arquivos', en: '## files' },
  groupText: { pt: '## texto e pipes (ex.: grep java | head -3)', en: '## text and pipes (e.g. grep java | head -3)' },
  groupPortfolio: { pt: '## portfolio', en: '## portfolio' },
  groupSystem: { pt: '## sistema', en: '## system' },
} satisfies Record<string, Localized>

/** Singular e plural para o resumo do tree. */
export const treeWords: Localized<{ dir: [string, string]; file: [string, string] }> = {
  pt: { dir: ['pasta', 'pastas'], file: ['arquivo', 'arquivos'] },
  en: { dir: ['directory', 'directories'], file: ['file', 'files'] },
}

/** Comandos que aparecem como botões embaixo do terminal. */
export const chips: Localized<string[]> = {
  pt: ['help', 'ls', 'tree', 'cd projetos', 'grep java', 'sobre', 'contato', 'clear'],
  en: ['help', 'ls', 'tree', 'cd projects', 'grep java', 'about', 'contact', 'clear'],
}
