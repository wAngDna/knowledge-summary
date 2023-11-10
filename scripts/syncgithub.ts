#!/usr/bin/env node
import { Command } from 'commander'
import { $ } from 'zx'
import type { ProcessOutput } from 'zx'
import { actions, inquirers } from './configs/commander'
import { printObject } from './utils'
const GitHubURL = 'https://github.com/wAngDna/knowledge-summary.git'
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

const pushGit = async (origin: 'gitee' | 'github' | 'all') => {
  if (origin === 'github') {
    // 如果没有名叫 github 的远程仓库则自动关联一个
    await $`git remote get-url --all github`.catch(async (out: ProcessOutput) => {
      printObject(out)
      console.log('remote github now...\n')
      // 关联github仓库
      await $`git remote add github ${GitHubURL}`.catch((out: ProcessOutput) => {
        printObject(out)
        throw new Error(out.stdout)
      })
      // 提交到github master
      await $`git push github master`.catch(async (out: ProcessOutput) => {
        printObject(out)
        throw new Error(out.stdout)
      })
    })
    // 如果有 则直接提交到github master
    await $`git push github master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
  } else if (origin === 'gitee') {
    await $`git push origin master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
  } else if (origin === 'all') {
    await $`git push origin master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
    // 如果没有名叫 github 的远程仓库则自动关联一个
    await $`git remote get-url --all github`.catch(async (out: ProcessOutput) => {
      printObject(out)
      console.log('remote github now...\n')
      // 关联github仓库
      await $`git remote add github ${GitHubURL}`.catch((out: ProcessOutput) => {
        printObject(out)
        throw new Error(out.stdout)
      })
      // 提交到github master
      await $`git push github master`.catch(async (out: ProcessOutput) => {
        printObject(out)
        throw new Error(out.stdout)
      })
    })
    // 如果有 则直接提交到github master
    await $`git push github master`.catch(async (out: ProcessOutput) => {
      printObject(out)
      throw new Error(out.stdout)
    })
  }
}
