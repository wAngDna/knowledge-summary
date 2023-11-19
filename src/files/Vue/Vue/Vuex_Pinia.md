## Vuex

遵循的规则：状态集中到 store 对象中，提交 mutation 是更改状态的唯一方法，同步，异步逻辑分装到 action 中。

```js
// 伪代码
export default Store = {
	state: {
		count: 1,
	},
	mutation: {},
	actions: {},
	getters: {},
};
```

### Store

Vuex 的状态存储是响应式的，其中 state 就是仓库对象，本质就是一个对象。不能之间改变 state 的值，需要提交 mutation 来修改状态。

```js
export default Store = {
	state: {
		count: 1,
	},
	mutation: {
		addCount(state) {
			state.count++;
		},
	},
	actions: {},
	getters: {},
};
```

### Getter

从 store 的 state 中派生出一些状态，多个组件都需要派生的状态。

## Pinia
