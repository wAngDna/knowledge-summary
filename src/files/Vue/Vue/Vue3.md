### Composition API

Vue2 的选项式 API，虽然很规整，但是写法有些臃肿，不够灵活，CompositionAPI 的出现正是解决此问题，写法更加简单，用法更加灵活。组合式实现了 UI 复用与状态逻辑复用的分离，俩者在底层编译和转换时区别很大

1. setup 的理解

就是组合式 API 的入口

2. ref 和 reactive 的区别

ref(obj) === reactive({key: value});
ref 内部使用了 reactive

3. ref 和 shallowRef 的区别，reactive 和 shallowReactive 的区别

shallow 表示浅层，这里指响应值作用在第一层，即.value，不过我们可以使用 triggerRef(xxx)来在深层内容变更后，手动触发更新，需要注意的是 shallowReactive 没有对应方法

4. watchEffect 和 watch 的区别

- 懒执行副作用
- 更加明确是应该由哪个状态触发监听器重新执行
- 可以访问所以监听器状态的前一个值和当前值

### 生命周期

setup -> beforeCreate -> create -> onBeforeMount -> onMounted -> on beforeUpdate -> onUpdated -> onBeforeUnmount -> onUnmounted

### 异步组件

在大型项目中，需要将应用拆分更小的块，并仅在需要时再从服务器加载相关组件，所以我们的组件可能不再是同步导入而是组件需要等待加载，在 Promise resolve 完成后才被渲染，这样的组件称为异步组件。

Vue3 通过 defineAsyncComponent 方法来引入异步组件

```js
// 通过异步组件形式定义
// 之所以webpack或者是vite能做chunk，或者是tree shaking，都是得益于ESMoudle
// commomjs 是不支持 tree shaking 的，因为依赖不透明
const AsyncComponent = defineAsyncComponent(() => import("./component.vue"));
// 使用
<template>
<AsyncComponent />
</tempalte>
```

异步组件通常与 Suspense 配合使用，Suspense 是一个内置组件，用来在组件树中协调对异步依赖的处理，让我们可以在组件树上层等待下层的多个嵌套异步依赖解析完成，并可以等待时渲染一个加载状态

### 自定义指令

### Teleport

### 自定义 Hooks
