import inquirer from 'inquirer'
const actions = {
  gitee: {
    alias: 'gt',
    description: '提交到gitee',
    examples: ['npm run push-gitee']
  },
  github: {
    alias: 'gh',
    description: '提交到github',
    examples: ['npm run push-github']
  },
  all: {
    alias: 'al',
    description: '选择提交到 gitee or github',
    examples: ['npm run push']
  }
}
const inquirers = {
  pushTo: () => {
    return new Promise((resovle, reject) => {
      // @ts-ignore
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'select push target',
            message: 'push target:',
            default: 'all',
            choices: [
              { value: 'all', name: 'gitee & github' },
              { value: 'gitee', name: 'gitee' },
              { value: 'github', name: 'github' }
            ]
          }
        ])
        .then((res) => {
          resovle(res['select push target'])
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
export { actions, inquirers }
