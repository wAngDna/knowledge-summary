import { ProcessOutput } from 'zx/core'
import { chalk } from 'zx'
export function printObject(
  object: Record<string, unknown> | ProcessOutput,
  method: 'log' | 'warn' | 'error' = 'log'
) {
  for (const [key, value] of Object.entries(object)) {
    // eslint-disable-next-line no-console
    console[method](`${key}:\n${value}\n`)
  }
}

export const chalkHex = (text: String) => {
  console.log('\n')
  console.log(chalk.hex('#67C23A').bold(text))
  console.log('\n')
}
