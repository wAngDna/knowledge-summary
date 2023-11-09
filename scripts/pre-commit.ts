#!/usr/bin/env zx

import { $ } from 'zx'

console.log('开始执行代码质量评估...\n')

await import('./check').catch((out) => {
  throw new Error('代码质量评估失败, 请检查代码.')
})

console.log('printf "检测通过, run build now...\n')

await import('./build').catch((out) => {
  throw new Error('代码打包失败, 请修复.')
})

console.log('printf "build success, run deploy now...\n')

await import('./deploy').catch((out) => {
  throw new Error('Git Pages上传失败, 请排查原因.')
})

console.log('printf "deploy success,  Sync GitHub now...\n')

await import('./syncgithub').catch((out) => {
  throw new Error('GitHub Push, 请排查原因.')
})

await $`git add .`
