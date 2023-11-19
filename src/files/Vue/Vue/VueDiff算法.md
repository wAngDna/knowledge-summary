### Vue Diff 算法

#### 什么是 Diff

当组件创建和更新时，vue 都会执行内部 `update` 函数，该函数使用 `render` 函数生成虚拟 `DOM`，组件会指向新树，然后 vue 会将新旧俩颗树进行对比，找到差异点，最终更新到真实 `DOM`。

对比差异的过程就是 `diff`，vue 在内部通过一个 `patch` 函数完成该过程。

在对比时，vue 采用`深度优先，逐层比较`的方式进行对比。在判断俩个节点是否相同时，vue 是通过虚拟节点的 `key` 和 `tag` 来进行判断的。

具体来说，首先对根结点进行对比，如果相同，则将旧节点关联的真实 `DOM` 的引用挂到新节点上，然后根据需要更新的属性到`真实 DOM` 上，然后再对比其子节点数组；如果不同，则按照新节点的信息递归创建`所有真实 DOM`，同时挂到对应虚拟节点上，然后移除旧的 `DOM`。

在对比子节点数组时，vue 对每个子节点数组使用了俩个指针，分别`指向头尾`，然后`不断向中间靠拢`来进行对比，这样做的目的是`尽量复用真实 DOM`，尽量少的`销毁和创建`真实 `DOM`，如果发现相同，则进入和根节点一样的对比流程，如果发现不同，则`移动`真实 `DOM` 到合适位置。

这样一直递归的遍历下去，直到整颗树完成对比(全量遍历)。

#### diff 的时机

当组件`创建`时，或者依赖的`属性或者数据`发生改变时，会运行一个函数，该函数做了俩件事

- 运行`_render`生成一颗新的`虚拟 DOM` 树
- 运行`_update`，传入`虚拟 DOM` 树根节点，对比新旧俩颗树，最终完成对`真实 DOM` 的更新

```js
function Vue() {
	// 运行一个函数
	const updateComponent = () => {
		// 运行render生成新树，传入update中
		this._update(this._render());
	};
	// 监听函数执行过程，观察函数执行期间用到了那些响应式数据
	new Watcher(updateComponent);
	// ... 其他代码
}
```

diff 就发生在`_update`执行的过程。

1. update 函数在干什么

该函数接受一个 `vnode`，这就是新生成的`虚拟 DOM`。 同时，该函数通过当前组件的`_vnode` 属性，拿到旧的`虚拟 DOM` 树，该函数首先会给组件的`_vnode` 属性重新赋值，让它指向新树。

然后会判断旧树是否存在：

- 不存在：说明是第一次挂载，于是用内部`patch`函数，直接遍历新树，为每个节点生成`真实 DOM`，挂载到每个节点的`elm`属性上。

- 存在：说明之前已经渲染过该组件，于是通过内部`patch`函数，对新旧俩颗树进行对比，以达到下面俩个目标： 1.完成对所有`真实 DOM` 的最小化处理。 2.让新树的节点对应合适的`真实 DOM`。

2. `patch`函数的对比流程

一些术语：

- 相同：是指俩个虚拟节点的`标签类型`、`key` 值均相同，但是 `input` 元素还要看 `type` 属性
- 新建元素：是指根据一个虚拟节点提供的信息，创建一个`真实 DOM` 元素，同时挂载到虚拟节点的 `elm` 属性上
- 销毁元素：是指：`vnode.elm.remove()`，移除的是`真实 DOM`
- 更新：是指对俩个虚拟节点进行对比更新，它仅发生在俩个虚拟节点「相同」的情况下。将旧节点对应的`真实 DOM` 赋值给新节点的`elm`属性，然后对比所有子节点。
- 对比子节点：是指对俩个虚拟节点的子节点进行对比。

详细流程：

- 对比根节点：如果不相同则直接根据`新虚拟 DOM` 创建`真实 DOM`，旧节点销毁元素。如果「相同」则进入「更新」流程，对比新节点和旧节点的属性，有变化的更新到`真实 DOM` 中，当前面俩个节点处理完毕，开始对「比子节点」

- 对比子节点：在对比子节点时，vue 一切的出发点都是为了效率，尽量不做任何操作 -> 尽量仅仅改动元素属性 -> 尽量移动元素而不是删除和创建元素 -> 删除和创建元素

3. 为什么要加`key`值

如果没有 `key` 值，vue 处理时是直接修改`真实 DOM` 内容，反之则是有其他优化手段，例如移动指针，进行对比后，有可复用元素就用。效率提高很多

#### Vue2 diff

先判断新 vnode 是否为空，如果老的节点在，新的节点不存在，则卸载所有老的 vnode

如果老的节点不在，则直接创建即可

当老节点不是真实 dom 节点，并且新老节点的 type 和 key 相同时，进行 patchVnode 更新工作

#### patchVnode

1. vnode 和 oldVnode 指向同一个对象就直接 return，不做操作

2. oldVnode DOM 关联到真实 elm，然后进行更新 update class style props events 等等

3. oldVnode 和 vnode 如果是标签类型是简单的文本节点，只更新文本内容

4. oldVnode 有子节点， vnode 没有子节点，直接删除子节点

5. oldVnode 没有子节点 vnode 有子节点， 添加节点，调用 createElement 方法 然后挂载到 DOM 上

6. oldVnode 和 vnode 都有子节点，如果新老节点的子节点不一样，就执行 updateChildren 函数，对比子节点，如果新节点有子节点，老节点没有，就清空老节点，插入新节点，如果新节点没有子节点，老节点有，就删除老节点的子节点。如果是文本节点就清空，最后如果老节点的文本和新节点的文本不同，就更新文本

#### updateChildren（双端比较过程）

```ts
/**
 * diff双端比较
 */
function vue2Diff(prevChildren: any[], nextChildren: any[], parent: any) {
	let oldStartIndex = 0,
		oldEndIndex = prevChildren.length - 1,
		newStartIndex = 0,
		newEndIndex = nextChildren.length - 1;

	let oldStartNode = prevChildren[oldStartIndex],
		oldEndNode = prevChildren[oldEndIndex],
		newStartNode = nextChildren[newStartIndex],
		newEndNode = nextChildren[newEndIndex];

	// 遍历循环边界条件
	while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
		// 头头比较
		if (oldStartNode.key === newStartNode.key) {
			patch(oldStartNode, newStartNode, parent);
			oldStartIndex++;
			newStartIndex++;
			oldStartNode = prevChildren[oldStartIndex];
			newStartNode = nextChildren[newStartIndex];
		}
		// 尾尾比较
		else if (oldEndNode.key === newEndNode.key) {
			patch(oldEndNode, newEndNode, parent);
			oldEndIndex--;
			newEndIndex--;
			oldEndNode = prevChildren[oldEndIndex];
			newEndNode = nextChildren[newEndIndex];
		}
		// 头尾比较
		else if (oldStartNode.key === newEndNode.key) {
			patch(oldStartNode, newEndNode, parent);
			parent.insertBofore(oldStartNode.el, oldEndNode.el.nextSibling);
			oldStartIndex++;
			newEndIndex--;
			oldStartNode = prevChildren[oldStartIndex];
			newEndNode = nextChildren[newEndIndex];
		}
		// 尾头比较
		else if (oldEndNode.key === newStartNode.key) {
			patch(oldEndNode, newStartNode, parent);
			oldEndIndex--;
			newStartIndex++;
			oldEndNode = prevChildren[oldEndIndex];
			newStartNode = nextChildren[newStartIndex];
		}
	}
  // 四次比较都没有比较到
  else {
    //需要拿旧节点当前的key，拿着这个key遍历新节点，找找有没有相同的key
    let newKey = newStartNode.key;
    oldIndex = prevChildren.findIndex(child => child.key === newKey);
    if(oldIndex > -1) {
      let oldNode = prevChildren[oldIndex];
      // 进行更新
      patch(oldNode, newStartNode, parent);
      // 插入元素
      parent.insertBofore(oldNode.el, oldStartNode.el);
      prevChildren[oldIndex] = undefined;
    }
    else {
      mount(newStartNode, parent, oldStartNode.el);
    }
    newStartNode = nextChildren[++newStartIndex];
  }
  if(oldEndIndex < oldStartIndex) {
    // 新节点的节点在旧节点中不存在，则直接将新节点插入
    for(let i =0; i < newEndIndex; i++){
      mount(nextChildren[i]);
    }
  }
  // 旧节点的节点 再新节点中没有  则移除旧节点的节点
  else if (newEndIndex < newStartIndex) {
    parent.removeChild(prevChildren[i]);
  }
}

/**
 * patch 一定会进行render，但是是否是一次patch一次render，还是最终会进行一次render
 * @param {any} oldEndNode 旧节点
 * @param {any} newEndNode 新节点
 * @param {any} parent 父节点，在父节点里更新
 */
function patch(oldEndNode: any, newEndNode: any, parent: any) {
	// do some
}
```

### Vue3 diff

1. 相对于 vue2 diff 的优化点

非全量 diff， DOM 静态 tag，比较有静态标记的 tag(将需要比较的内容做静态标记)

```ts
// 静态标记
function vue3Diff(prevChildren: any[], nextChildren: any[], parent: any) {
	let j = 0,
		prevEnd = prevChildren.length - 1,
		nextEnd = nextChildren.length - 1,
		prevNode = prevChildren[j],
		nextNode = nextChildren[j];
	// 将指针进行初始化，都指向第一位，头头比较
	while (prevNode.key === nextNode.key) {
		// 如果新旧节点头头一样，直接patch更新
		patch(prevNode, nextNode, parent);
		// 然后进行j++ 指针都向后移动一位
		j++;
		// 然后赋值节点，进行下一轮循环
		prevNode = prevChildren[j];
		nextNode = nextChildren[j];
	}
	// 当结果不匹配了 将指针挪到各自最后一位
	prevNode = prevChildren[prevEnd];
	nextNode = nextChildren[nextEnd];
	// 判断尾 尾一不一样
	while (prevNode.key === nextNode.key) {
		// 如果相同进行patch
		patch(prevNode, nextNode, parent);
		prevEnd--;
		nextEnd--;
		// 然后各自往前移动指针，进行下轮循环
		prevNode = prevChildren[prevEnd];
		nextNode = nextChildren[nextEnd];
	}
}
```

2. 最长递增子序列

最长递增子序列：
[0, 8, 4, 12, 5, 3, 16];
[0, 8, 12, 16];
[0, 4, 5, 16];

3 种情况：1.如果节点下标为-1，则直接创建一个元素，插入到最后。2.如果存在最长递增子序列，则不需要挪动位置，3.将不是最长递增子序列的元素，挪动到最长递增子序列中，按照递增排序
