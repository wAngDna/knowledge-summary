#!/usr/bin/env zx

import { $ } from 'zx'
import { chalkHex } from './utils'

chalkHex('开始执行代码质量评估...')

await import('./check').catch((out) => {
  throw new Error('代码质量评估失败, 请检查代码.')
})

chalkHex('Check success, create commit...')

await $`git add .`
