#!/usr/bin/env zx

import { $ } from 'zx'
import { chalkHex } from './utils'

chalkHex('开始执行代码质量评估...')

await import('./check').catch((out) => {
  throw new Error('代码质量评估失败, 请检查代码.')
})

chalkHex('检测通过, run build now...')

await import('./build').catch((out) => {
  throw new Error('代码打包失败, 请修复.')
})

chalkHex('Build success, run deploy now...')

await import('./deploy').catch((out) => {
  throw new Error('Git Pages上传失败, 请排查原因.')
})

chalkHex('Deploy success, create commit...')

await $`git add .`
