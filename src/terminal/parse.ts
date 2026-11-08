/**
 * Quebra a linha digitada em argumentos, como um shell simples:
 * espaços separam, aspas simples ou duplas juntam ("dois termos"), \ escapa o próximo caractere.
 */
export function tokenize(input: string): string[] {
  const args: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let started = false // distingue "" (argumento vazio) de nada

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (ch === '\\' && quote !== "'" && i + 1 < input.length) {
      current += input[++i]
      started = true
    } else if (quote) {
      if (ch === quote) quote = null
      else current += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
      started = true
    } else if (/\s/.test(ch)) {
      if (started) args.push(current)
      current = ''
      started = false
    } else {
      current += ch
      started = true
    }
  }

  if (started) args.push(current)
  return args
}
