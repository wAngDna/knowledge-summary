### Vue

#### 生命周期

#### 创建 Vue 实例和创建组件流程基本一致

1. 首先进行初始化操作，设置私有属性到实例中。
2. 运行生命周期钩子函数 `beforeCreate` 。
3. 进入注入流程：`处理属性、computed、methods、data、provide、inject`，最后使用代理模式将他们挂载到实例中。
4. 运行生命周期函数 `created`。
5. 生成`render`函数：如果有配置，直接使用配置的`render`，如果没有，使用运行时编译器，把模板编译为`render`。
6. 运行生命周期函数 `beforemount`。
7. 创建一个`Watcher`，传入一个函数`updateComponent`，该函数会运行`render`，得到的`vnode`再传入`_update`函数执行。

在执行 `render` 函数的过程中，会收集所有依赖，将来依赖变化时会重新执行 `updateComponent` 函数。
在执行`_update` 函数的过程中，会触发 `patch` 函数，由于目前没有旧树，因此直接为当前的`虚拟 DOM` 树的每一个节点生成`真实 DOM`。
如果遇到创建一个组件的 `vnode`，则会进入组件实例化流程，该流程和创建 Vue 实例流程基本相同，最终会把创建好的组件实例挂载 `vnode` 的 `componentInstance` 属性中，以便复用。

8. 运行生命周期函数 `mounted`。

#### 重渲染

1. 数据变化后，所有依赖该数据的 `Watcher` 均会重新运行。
2. `Watcher` 会被调度器放到 `nextTick` 中运行(放入微任务队列中)，这样是为了避免多个依赖的数据同时改变后被多次执行。
3. 运行生命周期函数 `brforeUpdate` 。
4. `updateComponent` 函数重新执行。

在执行 `render` 函数过程中，会去掉之前的依赖，重新收集依赖，将来依赖变化时重新运行 `updateComponent` 函数。
在执行`_update` 函数的过程中，会触发 `patch` 函数。
新旧俩颗树进行对比。普通 `html` 节点的对比会导致真实节点被创建、函数、移动、更新。
组件节点的对比会导致组件被创建、删除、移动、更新。
当新组件需要创建时，进入实例化流程。
当旧组件需要删除时，会调用旧组件的`$destroy`方法删除组件，该方法会先触发生命周期函数`beforeDestroy`，然后递归调用子组件的`$destroy` 方法。
然后触发生命周期函数 `destroyed`。
当组件更新时，相当于组件的 `updateComponent` 函数重新被触发执行，进入重渲染流程，流程同上。

5. 运行生命周期函数`updated`。

#### v-model

既可以作用于表单元素，也可以作用于自定义组件，是一个语法糖，当作用于表单元素时，vue 会根据作用的表单元素类型而生成合适的属性和事件，比如 input 会生生成 value 和 input 事件。而作用于单选框时，会生成 checked 属性和 change 事件。
当作用于自定义组件时，默认情况下，会生成 value 属性和 input 事件。

```html
<Com v-model="data"></Com>
<!-- 等效于 -->
<Com @input="$event" :value="data"></Com>
```

#### computed 和 methods 有什么区别

`methods` 中，`vue` 的处理方式是遍历 `methods` 中的每个属性，然后放入 `vue` 实例中，使用 `bind` 将函数 `this` 绑定到当前组件实例中，然后复制函数的引用到组件实例中即可。

`computed` 处理会复杂一些：遍历 `computed` 中的所有属性，为每一个属性创建一个 `Watcher` 对象，并传入一个函数，该函数本质就是 `computed` 的 `getter` 函数，这样一来，`getter` 运行过程就会收集依赖。

和渲染函数不一样的是，计算属性的 `Watcher` 不会立即执行，因为要考虑到计算属性是否会被渲染，如果没有就不会得到执行。因此，创建 `Wathcer` 时，使用了 `lazy` 配置，`lazy` 配置可以让 `Watcher` 不会立即执行。

受到 `lazy` 的影响，`Wathcer` 内部会保存俩个关键字来实现缓存，一个是 `value`，一个是 `dirty`：
`value` 属性用于保存 `Watcher` 运行的结果，开始是 `undefined`。
`dirty` 属性用于指示当前的 `value` 是否已经过时了，就是是否是脏值，开始是 `true`。

`Watcher` 创建好后，`vue` 会使用代理模式，将计算属性挂载到组件实例中。
当读取计算属性时，`vue` 检查其对应的 `Watcher` 是否是脏值，如果是，则运行函数，计算依赖，并得到对应的值，保存在 `Watcher` 的 `value` 中，然后设置 `dirty` 为 `false`，然后返回。如果 `dirty` 为 `false`，则直接返回 `Watcher` 的 `value`，这也是 `computed` 的缓存。

巧妙的是，在依赖收集时，被依赖的数据不仅会收集到计算属性的 `Watcher`，还会收集到组件的 `Wathcer`，当计算属性的依赖变化时，会先触发计算属性的 `Watcher` 的执行，它只需要设置 `dirty` 为 `true` 即可。然后执行组件的 `Watcher`，组件的 `Watcher` 执行时，会触发计算属性的 `Watcher`，这时候计算属性的 `Watcher` 已经时脏值，会重新执行计算属性的 `getter` 函数，重新计算值。

#### Vue 优化

1. 使用 Key

对于通过循环渲染的列表数据，应该给每个元素一个稳定唯一的 `key` 值，有利于表变动时，vue 尽量少的删除和新增元素。在 `diff` 算法中，列表变动后，新旧俩颗树对比时，`vue` 通过 `key` 可以更快的重复使用可重复使用的元素，更少的删除和创建新元素。

2. 使用冻结对象

冻结的对象不会被响应化

3. 使用函数式组件

4. 使用计算属性

如果模板中的某个数据会使用多次，并且该数据是通过计算得到的，那么推荐使用计算属性进行缓存

5. 非实时绑定的表单项

使用 `v-model` 绑定一个表单项时，当用户改变表单项状态时，会改变数据，页面会重渲染，这会带来一些性能开销。
特别是当用户改变时，页面还有一些动画正在进行中，由于 JS 执行线程和浏览器渲染进程是互斥的，会导致动画卡顿。
我们可以通过 `lazy` 或者不使用 `v-model` 的方式来解决该问题，但是这样会导致某一个时间短内数据和表单项的值不一致。

6. 保持对象的引用稳定

在大多数情况下，`vue` 触发 `rerender` 的时机是依赖数据的变化的。
若数据没有发生变化，哪怕是给数据重新赋值了，`vue` 也是不会做出任何处理的

```js
// vue判断数据有没有变化的源码
if (newVal === value || (newValue !== newValue && value !== value)) {
	return;
}
```

因此，如果需要，只要能保证组件的依赖数据不发生变化，组件就不会重渲染。
对于原始数据，保持其值不变即可。
对于复杂类型数据，保证其引用不变即可。

7. 使用 `v-show` 替代 `v-if`

对于频繁切换显示显隐的元素，使用 `v-show` 可以保证虚拟 DOM 的稳定，避免重复新增和删除元素，特别是对于包含大量 DOM 的元素节点。

8. 使用延迟装载(defer)

首屏加载过慢的原因一个是打包体积过大，另一个就是一次性渲染的东西过多，打包体积可以去优化，另一个优化手段就是延迟装载，让组件按照指定的选后顺序一个一个渲染。
本质就是利用 `requestAnimationFrame` 事件分批渲染内容。

#### keep-alive

vue 的内置组件，用于缓存内部组件实例。`keep-alive` 内部的组件切回时，不用重新创建组件实例，而是直接使用缓存中的实例，能够避免重复创建组件，还可以保留组件状态。

- `include`：哪些组件缓存，可以是字符串，数组和正则表达式。
- `exclude`：哪些组件不缓存，可以是字符串，数组和正则表达式。
- `max`：最大缓存数，当达到最大数量时，会移除最久没有使用的组件缓存(`key 数组的第一个元素`)。

被`keep-alive`缓存的组件有俩个单独的生命周期函数

- `activated`：组件激活时调用
- `deactivated`：组件切出时调用

具体的实现上，`keep-alive`在内部维护了一个`key数组`和一个缓存对象，`key数组`记录目前缓存的组件的 key 值，如果没有`key`值，则会自动生成一个`唯一的key值`。cache 对象以`key值为键`，`vnode为值`，用于缓存组件对应的`虚拟DOM`。
在 `keep-alive` 的渲染函数中，其基本逻辑时判断当前渲染的 `vnode` 是否有对应的缓存，如果有，从缓存中读取到对应的组件实例；如果没有则将其缓存。
当缓存数量超过 `max 数值`时，keep-alive 会移掉 `key 数组的第一个元素`。

### 路由

#### 导航守卫

1. 全局前置守卫

```js
router.beforeEach((to, from, next) => {
	// to 要去的路由,一个Route对象
	// from 来的路由对象
	// next 一个方法，要想继续下去，必须调用next()
	// 如果next(error) 传入的参数是一个Error实例，则导航会被终止，且该错误会被传递给router,onError注册过的回调
});
```

2. 全局解析守卫

在 2.5.0+，可以用 router.brforeResolve 注册一个全局守卫。是在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫会被调用。

3. 全局后置钩子

```js
router.afterEach((to, from) => {
	// 不会接受next参数，导航已经切换完成，无法再对导航进行改变
});
```

4. 路由独享守卫

```js
const router = new VueRouter({
	routes: [
		{
			path: "/",
			components: Foo,
			beforeEnter: (to, from, next) => {
				// 与前置路由参数一致
			},
		},
	],
});
```

5. 组件内守卫

```js
beforeRouteEnter(to, from, next) {
  // 在渲染该组件的对应路由被confirm前调用
  // 此时不能获取组件 this
  // 因为当前守卫执行前，组件实例还没被创建
  // 想要访问实例 可以通过此方法
  next(vm => {
    // 通过 vm 访问组件实例
  })
}

beforeRouteUpdate(to, from, next) {
  // 在当前路由改变，但是该组件被复用时调用
  // 举例来说，对于一个带有动态参数的路径 /foo:id，在/foo/1 和 /foo/2 之间跳转的时候
  // 由于会渲染相同的Foo组件，因此组件实例会被复用，这个钩子会被调用
  // 可以访问组件实例 this
}

beforeRouteLeave(to, from, next) {
  // 路由离开该组件的对应路由时被调用
  // 可以访问 this
}
```

6. 完整的导航解析流程

导航守卫被触发 -> 在失活的组件里调用 `beforeRouteLeave` 守卫 -> 调用全局的 `beforeEach` 守卫 -> 在重复的组件里调用 `beforeRouteUpdate` 守卫 -> 在路由配置里调用 `beforeEnter` -> 解析异步路由组件 -> 在被激活的组件里调用 `brforeRouteEnter` -> 调用全局的 `beforeResolve` -> 导航被确定 -> 调用全局的 `afterEach` 钩子 -> 触发 `DOM` 更新 -> 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会被作为回调函数的参数传入

#### mixin 复用
