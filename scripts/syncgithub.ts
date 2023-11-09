#!/usr/bin/env zx

import type { ProcessOutput } from 'zx'
import { $ } from 'zx'
import { printObject } from './utils'
const GITHUBURL = 'https://github.com/wAngDna/knowledge-summary.git'
await $`git remote get-url --all git`.catch((out: ProcessOutput) => {
  console.log(out)
})
