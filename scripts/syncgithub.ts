#!/usr/bin/env node
import { Command } from 'commander'
import { $ } from 'zx'
import type { ProcessOutput } from 'zx'
import { actions, inquirers } from './configs/commander'
import { printObject, chalkHex } from './utils'
const program = new Command()
Reflect.ownKeys(actions).forEach((action: any) => {
  program
    .command(action) //配置命令的名字
    .alias(actions[action].alias) // 命令的别名
    .description(actions[action].description) // 命令对应的描述
    .action(async () => {
      if (action === 'all') {
        const target: any = await inquirers.pushTo()
        await pushGit(target)
      } else {
        await pushGit(action)
      }
    })
})
program.parse()

/**
 * 提交代码到git仓库
 * @param {*} origin
 */
const pushGit = async (origin: 'gitee' | 'github' | 'all') => {
  if (origin === 'github') {
    chalkHex('pushed github...')
    await $`git push github master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
    chalkHex('push github success...')
  } else if (origin === 'gitee') {
    chalkHex('pushed gitee...')
    await $`git push origin master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
    chalkHex('push gitee success...')
  } else if (origin === 'all') {
    chalkHex('pushed gitee and github...')
    await $`git push origin master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
    chalkHex('push gitee success...')
    // 如果有 则直接提交到github master
    await $`git push github master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
    chalkHex('push github success...')
  }
}
