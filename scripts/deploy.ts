#!/usr/bin/env zx

import type { ProcessOutput } from 'zx'
import { $ } from 'zx'
import { printObject, chalkHex } from './utils'

chalkHex('Run build now...')

await import('./build').catch((out) => {
  throw new Error('代码打包失败, 请修复.')
})

chalkHex('Build success, run deploy now...')

await $`npm run deploy`.catch((out: ProcessOutput) => {
  printObject(out)
  throw new Error(out.stdout)
})

chalkHex('Deploy success...')
