#!/usr/bin/env zx

import { $ } from 'zx'
import type { ProcessOutput } from 'zx'
import { printObject } from './utils'
console.log('开始执行代码质量评估...\n')

await import('./check').catch((out) => {
  throw new Error('代码质量评估失败, 请检查代码.')
})

console.log('检测通过, run build now...\n')

await import('./build').catch((out) => {
  throw new Error('代码打包失败, 请修复.')
})

console.log('build success, run deploy now...\n')

await import('./deploy').catch((out) => {
  throw new Error('Git Pages上传失败, 请排查原因.')
})

console.log('deploy success,  Sync GitHub now...\n')

await import('./syncgithub').catch((out) => {
  throw new Error('GitHub Push失败, 请排查原因.')
})

console.log('github push success,  创建commit...\n')

await $`git add .`

await $`git push github master`.catch(async (out: ProcessOutput) => {
  printObject(out)
  throw new Error(out.stdout)
})
