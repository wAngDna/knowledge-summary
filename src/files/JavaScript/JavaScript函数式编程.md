## 前端代码格式化：

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
