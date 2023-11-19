## 前置知识

### Flow

Vue2 使用了 flow 来进行静态类型校验，由 Facebook 开发出来的。

1. 类型推断

```js
/* @flow */
// 在动态解析中，会报错，这段代码会报错
function split(str) {
	return str.split(".");
}

split(11);
```

2. 类型注释

```js
/* @flow */
function add(x: string, y: number) {
	return x + y;
}
// 会报错 和ts差不多
add("123", 456);
```

### runtime only 和 tuntime + compiler

1. runtime only

运行之前，需要将 .vue 文件 通过 vue-loader 转为 js 代码
运行时没有 vue-loader 时，需要使用此方法。

2. runtime + compiler(编译时间更短，但是写法更好)

在代码运行之前，需要先通过编译器 将代码进行转换，模板代码编译等

在编译时已经有 vue-loader 了，所以运行时已经时编译好的，选择此方法

new vue -> init -> $Mount -> compile -> render -> vnode -> patch -> DOM

### Vue 流程

当我们 new 一个 `Vue` 实例时，首先进行 `init` 操作，`init` 操作进行配置项合并，初始化等等操作，然后进行 mount 挂载操作，将配置项里面的节点`进行挂载`， 然后进行编译环节，将`模板文件编译成 AST`，最终通过 `render 函数生成 vnode`，通过 `patch 函数渲染成真实 DOM`
