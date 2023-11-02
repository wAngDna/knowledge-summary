#!/usr/bin/env zx

import type { ProcessOutput } from 'zx'
import { $ } from 'zx'
import { printObject } from './utils'


// check stage
await $`npm run lint:stage`.catch((out: ProcessOutput) => {
  printObject(out)
  throw new Error(out.stdout)
})
