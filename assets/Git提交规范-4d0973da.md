## 前端开发规范之 Git 提交 & 代码格式规范

用eslint + stylelint + husky + lint-staged + commitlint 实现前端代码提交规范流程

流程大概如下：

```js
// 功能开发完毕 提交前

git add .

// 规范流程入口
npm run commit 

// npm run commit todo 检测代码 fix 格式 // 选择提交类型，填写信息

git push

// 提交完毕
```
规范如下：

| Type | Description |
| :---        | :---- |
| feat | 新功能 |
| fix | 修复bug  |
| docs | 文档修改  |
| style | 代码格式修改，比如缩紧、空格等  |
| refactor | 代码重构  |
| test | 测试相关修改  |
| chore | 其他修改  |

### eslint 检测工程代码格式

1. 安装 eslint

```js
// 安装
npm i -D eslint
// 安装完后在项目中
eslint --init // 创建.eslintrc.cjs 配置文件
```

2. package.json 里添加script命令

```javascript

"script": {
  "lint": "eslint . --ext .vue,.js,.tsc,.jsx,.cjs,.ts --fix --ignore-path .gitignore"
}

// 执行
npm run lint // 即可检测代码规范
```

### stylelint 检测工程css格式

1. 安装 stylelint

```shell
npm i -D stylelint

#! 在项目中添加stylelint.config.js文件 配置规则

#! 安装几个共享的规包  
npm i -D stylelint-config-standard stylelint-config-prettier stylelint-config-html stylelint-config-vue

#! 在配置文件中添加
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier', 'stylelint-config-html/vue']
}
```

2. package.json 里添加script命令

```javascript

"script": {
  "lint:style": "stylelint **/*.{vue,css}"
}

// 执行
npm run lint:style // 即可检测css规范
```



**有了以上俩点，代码格式检测有了，但是总不能每次提交前都手动执行一遍修复命令，我们只需要在提交的时候进行一次修复就行，如果不合规范就不让提交，只有符合规范的代码才能提交到仓库中。**



### husky 管理 Git Hooks

在使用husky之前，先了解什么是Git Hooks。

Git Hooks：Git Hooks 是一种脚本，可以在Git生命周期的特定事件中运行。这些事件包括提交代码的不同阶段，例如提交前(pre-commit)和提交之后(post-commit)。

husky：husky是一个工具，允许我们轻松的管理Git Hooks，并在这些阶段运行我们想要的脚本。它通过项目中的.husky目录中的文件工作，配置husky来运行我们指定的脚本。之后，由husky负责管理在Git生命周期阶段中我们脚本的运行。



1. 安装 husky

```sh
npm install -D husky
```

2. package.json 添加script命令

```json
"scripts": {
  "prepare": "husky install"
}

```

执行 `npm run prepare`命令后，即可在项目根目录创建一个.husky文件夹

```js
// husky 目录结构如下
.husky
	_
  	.gitignore
		husky.sh
```

我们在.husky目录添加自己的Git Hooks脚本文件，有很多，但是目前用到的只有俩个，分别为`pre-commit（预提交钩子函数）` 和 `commit-msg（验证commit内容钩子函数）`

分别创建这俩个文件，放入.husky目录中，放入后，.husky目录结构如下：

```js
// husky 目录结构如下
.husky
	_
  	.gitignore
		husky.sh
	pre-commit
	commit-msg
```

此时，当我们进行Git操作时，会执行相应钩子函数文件内的shell脚本，脚本内容如下：

```sh
#! pre-commit

. "$(dirname "$0")/_/husky.sh"
#! 当找不到npm环境变量的时候需要暴露环境变量
PATH="/usr/local/bin:$PATH"
#! 需要执行的具体命令 这里是npm 编译执行pre-commit.ts文件，可以根据需求执行自己的命令
npm exec tsno run ./scripts/pre-commit.ts


#! commit-msg

. "$(dirname -- "$0")/_/husky.sh"
#! 当找不到npm环境变量的时候需要暴露环境变量
PATH="/usr/local/bin:$PATH"
#! 使用commitlint 检测 ${1} 这个参数是否合法，${1} 就是 我们 git commit -m ${1} 
npx --no -- commitlint --edit ${1}
#! 运行commitlint 使用美化后的cz-git创建commit信息
npm run commitlint ${1}
```



### prettier 进行代码格式美化

`eslint ` 一般是对代码语法进行检测，虽然它也能对代码格式进行简单检测，但是它只能检测 **js、vue、ts** 等文件风格，无法限制和检测css的代码格式。而 `prettier` 则是只能对代码格式进行检测和限制，能对各种类型文件进行格式检测和修复，所以一般我们是 **eslint + prettier **结合起来对代码格式和语法进行限制和修复的。 

1. 安装prettier

```sh
npm i -D prettier
```

2. package.json 添加script命令

```json
"scripts": {
  "format": "prettier --write src/"
}
```

3. 在根目录添加prettierp配置文件`.prettierignore` 和 `.prettierrc.json`

`.prettierignore`：配置哪些文件/文件夹不进行格式化操作

`.prettierrc.json`：配置检测格式化规则

当我们执行 `npm run format` 命令后，即可对src目录下所有文件进行代码格式化了



### lint-staged 对Git暂存区代码进行操作

上面我们配置的 `eslint` 检测修复、样式检测一般都是针对某些文件或者文件夹进行的，一般都是对src文件夹下所有文件进行检测修复操作，但是项目代码量特别大的话，对src下文件进行检测，这个消耗是特别大的，所以我们没必要对所有文件进行操作，而只操作需要操作的部门代码(提交到仓库中的公共代码)，`lint-staged` 就是这样的工具，它只对 **Git暂存区** 的代码进行扫描。我们每个人提交代码前只对暂存区代码进行操作，这样保证了提交到远程仓库的代码具有统一的格式。

1. 安装 lint-staged

```sh
npm i -D lint-staged
```

2. package.json 添加script命令

```json
"scripts": {
  "lint:stage": "lint-staged"
},
"lint-staged": {
  "*": "prettier --write", // 检测修复格式
  "*.{vue,ts}": "eslint --fix", // 检测修复语法
  "*.{html,vue,css,sass,scss}": "stylelint --fix" // 检测修复css
}
```



###  cz-git 符合国人git commit 的交互工具

辅助生成标准化规范化的commit message 工具

1. 安装完后添加script命令

```json
"config": {
  "commitizen": {
    "path": "./node_modules/cz-git"
  }
}
```



### 总结 & 流程梳理

我们有了对代码的语法检测修复、格式检测修复、css格式检测修复。也有了提交前能插一脚(Git Hooks)的能力，所以我们的流程是这样：

首先当我们功能开发完毕，准备提交到远程仓库或者代码进行本地存储时，先执行 git add . 将代码添加到暂存区，然后执行`npm run commit` , 当调用此命令时，会调用 `git cz`，唤起规范化交互式提交选择/填写，然后添加你的提交信息，填写完成后会触发pre-commit 钩子函数，进行代码检测以及修复，如果没问题就添加 `commit` 成功，反之则是提交失败，修改问题代码重复上面步骤即可。

代码实例

```sh
git add .
npm run commit 
// 选择 填写
```



随着多人开发团队推进着前端工程化的不断发展，团队规范与项目系统化配套工具链条也在不断诞生。这套工具结合的使用，能帮我们更好的管理公共代码。
