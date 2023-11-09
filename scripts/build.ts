#!/usr/bin/env zx

import type { ProcessOutput } from 'zx'
import { $ } from 'zx'
import { printObject } from './utils'

await $`npm run build`.catch((out: ProcessOutput) => {
  printObject(out)
  throw new Error(out.stdout)
})
