// Ajuda dos testes do terminal (só os arquivos .test.ts importam isto).
import { vi } from 'vitest'
import { lineText } from '../core/buffer'
import { registry } from '../pages/index'
import { runLine } from './commands'
import { buildFs, findDir } from './fs'
import type { CommandContext } from './types'

export const fs = buildFs(registry.all())

/** Contexto falso com as páginas de verdade. `cwd` aceita o id de uma pasta. */
export function fakeCtx(extra: Partial<Omit<CommandContext, 'cwd'>> & { cwd?: string } = {}): CommandContext {
  const { cwd, ...rest } = extra
  return {
    lang: 'pt',
    registry,
    fs,
    cwd: findDir(fs, cwd ?? null),
    setCwd: vi.fn(),
    open: vi.fn(),
    setLang: vi.fn(),
    theme: 'workspace',
    setTheme: vi.fn(),
    cmdHistory: [],
    stdin: null,
    ...rest,
  }
}

/** Roda e devolve só o texto de cada linha. */
export function run(input: string, ctx = fakeCtx()): string[] {
  return runLine(input, ctx).lines.map(lineText)
}
