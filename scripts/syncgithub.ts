#!/usr/bin/env zx

import type { ProcessOutput } from 'zx'
import { $ } from 'zx'
import { printObject } from './utils'
const GitHubURL = 'https://github.com/wAngDna/knowledge-summary.git'
await $`git remote get-url --all github`.catch(async (out: ProcessOutput) => {
  printObject(out)
  console.log('remote github now...\n')
  await $`git remote add github ${GitHubURL}`.catch((out: ProcessOutput) => {
    printObject(out)
    throw new Error(out.stdout)
  })
})
