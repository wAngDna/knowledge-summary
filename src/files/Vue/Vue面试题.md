<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-19 18:40:30
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-19 18:40:30
 * @FilePath: /knowledge-summaryp-review/src/files/Vue/Vue面试题.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
### vue 有哪些生命周期函数，以及各个生命周期做了些什么？

beforeCreate：组件的一些 options 都未被创建， el data methods data 等等都还没不能使用

created：实例已经完成创建，watch event data 都初始化完成，但是没有挂载，$el 无法获取

beforeMount：数据已经被劫持，下面就是开始渲染了

mounted：已经渲染完成，整体初始化完成

beforeUpdate：属性更新后，已经是 nextTick 之后的了

updated：已经经历了一系列操作，patch diff 然后调用 updated

bofroeDestory：

destoryed：在一些清理逻辑完成以后调用，父子关系，watcher 等执行关闭

### data 是一个函数的原因以及如何处理 vue 的模块化？

data 是一个函数主要是防止变量污染，用函数形式返回，是一个单独的作用域

### vue 指令有哪些？如何书写自定义指令？

自定义指令：Vue 允许我们通过全局注册和局部注册俩种方式，添加自定义指令

```js
  // 全局
  Vue.dircetive('demo', {
    // 只调用一次，指令第一次绑定元素时调用，主要进行初始化
    /**
     * 全局 bind参数
     * el 直接要绑定的元素
     * binding 一个对象，包括 name - 指令名字 ｜ value - 指令的值 ｜ oldValue - 值 ｜ arg - 参数 ...
     */
    bind(el, binding...) {},
    // 被绑定元素插入父节点时调用
    inserted() {},
    // 所在组件的Vnode 更新时调用
    update() {}
    // 所在组件Vnode更新后调用
    componentUpdated() {},
    // 只调用一次，解绑时
    unbind() {}
  });
  // 局部
  directives: {
    // 指令函数
		test:{
      // 钩子函数
			bind(el,bind){}
		},
	}
```

### Vue 组件传值方式？

1. props / $emit - 用于父子组件之间通信

- 优点：简单，常见，props 有类型检测
- 缺点：只能父子组件通信，无法跨组件通信

2. $ref / $children / $parent - 用于指向性通信

- 优点：能够拿到父子组件实例
- 缺点：难以维护，打破了数据的封装

3. $attrs / $listener - 隔代组件监听通信

- 常用对一些原生组件的封装

4. EventBus - 隔代 兄弟等非父子组件通信

- 优点： 原理简单，多层组件的事件传播
- 缺点： 很难模块化，多人开发，容易造成一些 Bug -=> 解决方案是 使用$on 监听， $off 取消监听

5. provide / inject - 隔代广播等

- 解决一层层传递的问题
- 非响应式

6. vuex - 整体状态机

- 多层组件的事件传播
- 单向数据流
- 统一状态管理

### 什么是函数式组件？
