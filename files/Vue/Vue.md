## 什么是MVVM模式

MVVM分为 model, view, viewmodel三者。

Model代表数据模型，数据和业务逻辑都在Model层中定义。

View代表视图层，负责数据的展示。

ViewModel负责监听Model中数据的变化并控制View层进行更新，处理用户交互操作。

Model和View通过ViewModel进行关联，它们之间有着双向绑定的联系，

## Vue响应式原理
#### 原理
Vue 的响应式原理是核心是通过 ES5 的保护对象的 Object.defindeProperty 中的访问器属性中的 get 和 set 方法，data 中声明的属性都被添加了访问器属性，当读取 data 中的数据时自动调用 get 方法，当修改 data 中的数据时，自动调用 set 方法，检测到数据的变化，会通知观察者 Wacher，观察者 Wacher自动触发重新render 当前组件（子组件不会重新渲染）,生成新的虚拟 DOM 树，Vue 框架会遍历并对比新虚拟 DOM 树和旧虚拟 DOM 树中每个节点的差别，并记录下来，最后，加载操作，将所有记录的不同点，局部修改到真实 DOM 树上。
#### 存在的一些问题
1. 无法监听数组改变：数组改变的所有变动及对象的新增和删除，只能使用数组变异方法(重新改写了原有的方法)及$set方法。
2. vue无法监听对象的新增和删除，直接通过obj.xxx = xxx新增一个没有的属性，同时修改当前组件的一个响应式的数据，会重新触发当前组件重新render，可以让非响应式数据也保持更新状态（并非响应式）。

#### vue3响应式对比vue2
1. vue2 不会对数组每个元素都监听，提升了性能.(arr[index] = newValue是不会触发试图更新的,这点不是因为defineProperty的局限性，而是出于性能考量的)
2. vue2 defineProperty不能检测到数组长度的变化，准确的说是通过改变length而增加的长度不能监测到(arr.length = newLength也不会)。
3. 同样对于对象，由于defineProperty的局限性，Vue2是不能检测对象属性的添加或删除的。
4. 相对于defineProperty，Proxy无疑更加强大，可以代理数组，并且提供了多种属性访问的方法traps(get,set,has,deleteProperty等等)。但是对于数组的一次操作可能会触发多次get/set,主要原因自然是改变数组的内部key的数量了(即对数组进行插入删除之类的操作),导致的连锁反应。

## 虚拟DOM

Virtual DOM是对DOM的抽象,本质上是JavaScript对象,这个对象就是更加轻量级的对DOM的描述。

既然我们已经有了DOM,为什么还需要额外加一层抽象?

首先,我们都知道在前端性能优化的一个秘诀就是尽可能少地操作DOM,不仅仅是DOM相对较慢,更因为频繁变动DOM会造成浏览器的回流或者重回,这些都是性能的杀手,因此我们需要这一层抽象,在patch过程中尽可能地一次性将差异更新到DOM中,这样保证了DOM不会出现性能很差的情况。

其次,现代前端框架的一个基本要求就是无须手动操作DOM,一方面是因为手动操作DOM无法保证程序性能,多人协作的项目中如果review不严格,可能会有开发者写出性能较低的代码,另一方面更重要的是省略手动DOM操作可以大大提高开发效率。

最后,也是Virtual DOM最初的目的,就是更好的跨平台,比如Node.js就没有DOM,如果想实现SSR(服务端渲染),那么一个方式就是借助Virtual DOM,因为Virtual DOM本身是JavaScript对象。

```javascript
// 真实DOM
<div id="dom1" class="dom2">
    dom
</div>

// 虚拟DOM
const vnode = {
    tag: 'div',
    props: {
        id: 'dom1',
        class: 'dom2'
    },
    children: ['dom']
}
```

## Vue diff 算法浅见

要知道渲染真实DOM的开销是很大的，比如有时候我们修改了某个数据，如果直接渲染到真实dom上会引起整个dom树的重绘和重排，有没有可能我们只更新我们修改的那一小块dom而不要更新整个dom呢？diff算法能够帮助我们。

我们先根据真实DOM生成一颗 virtual DOM ，当 virtual DOM 某个节点的数据改变后会生成一个新的 Vnode ，然后 Vnode 和 oldVnode 作对比，发现有不一样的地方就直接修改在真实的DOM上，然后使 oldVnode 的值为 Vnode 。

diff的过程就是调用名为 patch 的函数，比较新旧节点，一边比较一边给 真实的DOM 打补丁。

#### diff比较方式：

只会比较同级，不会进行跨级比较：
```javascript
<div>
    <p>1</p>
</div>

<div>
    <span>2</span>
</div>
//上面的代码会分别比较同一层的两个div以及第二层的p和span，但是不会拿div和span作比较。
```
#### Diff流程：
当数据发生变化时，set方法会让调用Dep.notify()通知所有订阅者Watche，订阅者就会调用patch给真实的DOM打补丁，更新相应的视图。
具体流程：
```javascript
function patch (oldVnode, vnode) {
 // some code
 if (sameVnode(oldVnode, vnode)) {
  patchVnode(oldVnode, vnode)
 } else {
  const oEl = oldVnode.el // 当前oldVnode对应的真实元素节点
  let parentEle = api.parentNode(oEl) // 父元素
  createEle(vnode) // 根据Vnode生成新元素
  if (parentEle !== null) {
   api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)) // 将新元素添加进父元素
   api.removeChild(parentEle, oldVnode.el) // 移除以前的旧元素节点
   oldVnode = null
  }
 }
 // some code 
 return vnode
}    
```

patch函数接收两个参数 oldVnode 和 Vnode 分别代表新的节点和之前的旧节点，判断两节点是否值得比较，值得比较则执行 patchVnode
```javascript
function sameVnode (a, b) {
 return (
 a.key === b.key && // key值
 a.tag === b.tag && // 标签名
 a.isComment === b.isComment && // 是否为注释节点
 // 是否都定义了data，data包含一些具体信息，例如onclick , style
 isDef(a.data) === isDef(b.data) && 
 sameInputType(a, b) // 当标签是<input>的时候，type必须相同
 )
}
```

不值得比较则用 Vnode 替换 oldVnode

如果两个节点都是一样的，那么就深入检查他们的子节点。如果两个节点不一样那就说明 Vnode 完全被改变了，就可以直接替换 oldVnode 。

虽然这两个节点不一样但是他们的子节点一样怎么办？别忘了，diff可是逐层比较的，如果第一层不一样那么就不会继续深入比较第二层了。

当我们确定两个节点值得比较之后我们会对两个节点指定 patchVnode 方法。那么这个方法做了什么呢？

```javascript
patchVnode (oldVnode, vnode) {
 const el = vnode.el = oldVnode.el
 let i, oldCh = oldVnode.children, ch = vnode.children
 if (oldVnode === vnode) return
 if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
  api.setTextContent(el, vnode.text)
 }else {
  updateEle(el, vnode, oldVnode)
  if (oldCh && ch && oldCh !== ch) {
   updateChildren(el, oldCh, ch)
  }else if (ch){
   createEle(vnode) //create el's children dom
  }else if (oldCh){
   api.removeChildren(el)
  }
 }
}
```

这个函数做了以下事情：

1. 找到对应的真实dom，称为 el。
2. 判断 Vnode 和 oldVnode 是否指向同一个对象，如果是，那么直接 return 如果他们都有文本节点并且不相等，那么将 el 的文本节点设置为 Vnode 的文本节点。
3. 如果 oldVnode 有子节点而 Vnode 没有，则删除 el 的子节点。
4. 如果 oldVnode 没有子节点而 Vnode 有，则将 Vnode 的子节点真实化之后添加到 el 如果两者都有子节点，则执行 updateChildren 函数比较子节点，这一步很重要

#### updateChildren 这个函数比较复杂，待我研究研究～

先说一下这个函数做了什么

1. 将 Vnode 的子节点 Vch 和 oldVnode 的子节点 oldCh 提取出来
2. oldCh 和 vCh 各有两个头尾的变量 StartIdx 和 EndIdx ，它们的2个变量相互比较，一共有4种比较方式。如果4种比较都没匹配，如果设置了 key ，就会用 key 进行比较，在比较的过程中，变量会往中间靠，一旦 StartIdx>EndIdx 表明 oldCh 和 vCh 至少有一个已经遍历完了，就会结束比较。

## Vue生命周期
1. `beforecreate`: 在实例初始化之后，这个时候数据还没有挂载，只是一个空壳，无法访问数据和真实的DOM 一般不做操作，执行一次。
2. `created`: 实例创建完成之后被调用，挂载数据 绑定事件 。 这个时候已经可以使用数据了，也可以更改数据，在这里更改数据不会出发updated,不会触发其他钩子函数，一般可以做初始化数据的获取，执行一次。
3. `beforeMount`: 在挂载开始之前被调用，这个时候虚拟DOM已经创建完成，马上就要渲染，这里可以更改数据 ，不会触发updated,渲染前最后一个更改数据的机会，不会触发其他钩子函数，一般可以在这里做初始化数据的获取。
4. `mounted`: 挂载到实例 渲染出真实的DOM，数据真实DOM都处理好了 ，事件已经挂载好了，可以在这里操作真实DOM，在这里可以进行第三方库的静态实例化了。
5. `beforeUpdate`: 数据更新时调用，发生在虚拟DOM重新渲染和补丁之前，当组件或实例的数据更改之后，会立即执行beforeUpdate，然后vue的虚拟dom机制会重新构建虚拟dom与上一次的虚拟dom树利用diff算法进行对比之后重新渲染，一般不做什么事儿。
6. `updated`: 由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子，当组件或实例的数据更改之后，会立即执行beforeUpdate，然后vue的虚拟dom机制会重新构建虚拟dom与上一次的虚拟dom树利用diff算法进行对比之后重新渲染，一般不做什么事儿。
7. `beforeDestory`: 实例销毁之前调用，般在这里做一些善后工作，例如清除计时器、清除非指令绑定的事件等等。
8. `destroyed`: 实例销毁之后调用，组件的数据绑定、监听...去掉后只剩下dom空壳，这个时候，执行destroyed，在这里做善后工作也可以。

## Vue中nextTick
有时候我们在做需求是，会发现遇到一类问题，例如我们需要在某些文字长度超过一定的长度后，来进行某些不同的操作。
```javascript
new Vue({
    el: '#app',
    data: {
        return () {
            text: ''
        }
    },
    mounted() {
        this.text = '很长一段话...'。
        // 这里我们需要获取dom判断是否超出阀值
        let element = document.getElementsByClassName('text');
        console.log(element.offsetHeight) // 0
    }
})
```
这时候我们发现，怎么都获取不到dom的正确高度，同样的情况，发生在给子组件传值上，我们发现复制后直接去找，是没有的。这就是异步更新特性所导致的，在vue官网中是这样描述的：

“可能你还没有注意到，Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部对异步队列尝试使用原生的 Promise.then、MutationObserver 和 setImmediate，如果执行环境不支持，则会采用 setTimeout(fn, 0) 代替。”

这样做的原因主要是为了提升性能，因为如果在主线程中更新dom，循环100次就要更新100次dom，但是如果是事件循环完之后更新dom，只需要更新一次。这对性能有很大的提升。
为了在数据更新操作之后操作DOM，我们可以在数据变化之后立即使用Vue.nextTick(callback)；这样回调函数会在DOM更新完成后被调用，就可以拿到最新的DOM元素了。

## Vue指令

 ### Vue中的常用指令

`v-text`: 元素的InnerText属性,必须是双标签。

`v-html`: 元素的innerHTML。

`v-if`: 判断是否插入这个元素。

`v-show`: 隐藏元素 如果确定要隐藏, 会给元素的style加上display:none。

`v-bind`: `v-bind`:属性名="常量||变量名"，简写形式 :属性名="变量名"。

`v-on`: `v-on`:事件名="表达式||函数名"，简写方式 @事件名="表达式"。

    v-text 只能用在双标签中
    v-text 其实就是给元素的innerText赋值
    v-html 其实就是给元素的innerHTML赋值
    v-if 如果值为false,会留下一个<!---->作为标记，万一未来v-if的值是true了，就在这里插入元素
    如果有if和else就不需要单独留坑了
    如果全用上  v-if 相邻v-else-if 相邻 v-else 否则 v-else-if可以不用
    v-if和v-else-if都有等于对应的值，而v-else直接写
    v-if家族都是对元素进行插入和移除的操作
    v-show是显示与否的问题
    注意: 指令其实就是利用属性作为标识符,简化DOM操作

### Vue自定义指令

除了核心功能默认内置的指令 (v-model 和 v-show)等外，Vue 也允许注册自定义指令。有的情况下，对普通 DOM 元素进行底层操作，这时候就会用到自定义指令。

Vue 提供了自定义指令的5个钩子函数：

1. bind：指令第一次绑定到元素时调用，只执行一次。在这里可以进行一次性的初始化设置。

2. inserted：被绑定的元素，插入到父节点的 DOM 中时调用（仅保证父节点存在）。

3. update：组件更新时调用。

4. componentUpdated：组件与子组件更新时调用。

5. unbind：指令与元素解绑时调用，只执行一次。

注意：

1. 除 update 与 componentUpdated 钩子函数之外，每个钩子函数都含有 el、binding、vnode 这三个参数

2. 在每个函数中，第一个参数永远是 el， 表示被绑定了指令的那个 dom 元素，这个el 参数，是一个原生的 JS 对象，所以 Vue 自定义指令可以用来直接和 DOM 打交道

3. binding 是一个对象，它包含以下属性：name、value、oldValue、expression、arg、modifiers

4. oldVnode 只有在 update 与 componentUpdated 钩子中生效

5. 除了 el 之外，binding、vnode 属性都是只读的

```javascript
export default {
    ... ...
    directives: {
        test: {
              bind (el,binding) {
                console.log('bind')
              },
              inserted () {
                console.log('inserted')
              },
              update () {
                console.log('update')
              },
              componentUpdated () {
                console.log('componentUpdated')
              },
              unbind () {
                console.log('unbind')
              }
        }
    }
}
```

## Vue过滤器

vue中的过滤器分为两种：局部过滤器和全局过滤器;
```javascript
// 全局过滤器
Vue.filter('msgFormat', function(msg) {    // msg 为固定的参数 即是你需要过滤的数据
    return msg.replace(/单纯/g, 'xxx')
})
// 局部过滤器
new Vue({
    el: '#app',
    data: {
        msg: '曾经，我也是一个单纯的少年，单纯的我，傻傻的问，谁是世界上最单纯的男人'
    },
    methods: {},
    //定义私用局部过滤器。只能在当前 vue 对象中使用
    filters: {
        dataFormat(msg) {
            return msg+'xxxxx';
        }
    }
});
```
注意：

1. 当有局部和全局两个名称相同的过滤器时候，会以就近原则进行调用，即：局部过滤器优先于全局过滤器被调用！

2. 一个表达式可以使用多个过滤器。过滤器之间需要用管道符“|”隔开。其执行顺序从左往右

## Vue插槽slot
在vue中插槽分为默认插槽(匿名插槽)，具名插槽和作用域插槽。插槽的作用就是在父组件中，向子组件派发内容，在子组件中使用slot作为内容的载体和分发出口。
#### 匿名插槽
```javascript
// 匿名插槽: 我们也可以叫它单个插槽或者默认插槽。和具名插槽相对，它是不需要设置  name 属性的，它隐藏的name属性为default。
// 子组件
<template>
    <div>我是子组件</div>
    <slot></slot>
</template>

// 父组件
<template>
    <div>我是父组件</div>
    <Child>
        <p>我添加到子组件</p>
    </Child> // 子组件
</template>

// 页面展示
// 我是父组件
// 我是子组件
// 我添加到子组件
// 在使用的时候还有一个问题要注意的 如果是有2个以上的匿名插槽是会child标签里面的内容全部都替换到每个slot；
```
#### 具名插槽
```javascript
// 具名插槽: 顾名思义就是slot 是带有name的，定义： <slot name="header" />  或者使用简单缩写的定义 #header  使用：要用一个 template标签包裹
// 子组件
<template>
    <div>我是子组件</div>
    <slot name="childSlot1"></slot>
    <slot name="childSlot"></slot>
</template>

// 父组件 
<template>
    <div>我是父组件</div>
    <Child>  // 子组件
        <temppate v-slot:childSlot1 >
            <p>我添加到子组件1</p>
        </temppate>
        <temppate  #childSlot>
            <p>我添加到子组件</p>
        </temppate>
    </Child> 
</template>

// 页面展示
// 我是父组件
// 我是子组件
// 我添加到子组件1
// 我添加到子组件
// 这里说一下多个具名插槽的使用 多个具名插槽，插槽的位置不是使用插槽的位置而定的，是在定义的时候的位置来替换的
```
#### 作用域插槽
```javascript
// 作用域插槽: 就是用来传递数据的插槽。
// v-solt可以解构接收 解构接收的字段要和传的字段一样才可以 例如 :one 对应  v-slot="{one}"
// 子组件
<template>
    <div>我是子组件</div>
    <slot :msg="msg"></slot>
    <slot v-bind:msg1="msg" name="slot1"></slot>
</template>
<script>
export default {
    data() {
        return {
            msg: {
                name: '111'
            }
        }
    }
}
</script>

// 父组件
<template>
    <div>我是父组件</div>
    <Child>
        <temppate v-slot="{ msg }" >
            <p>{{msg.name}}</p> // 111
        </temppate>
         <temppate v-slot:slot1="msgSlot" >
            <p>{{msgSlot.msg.name}}</p> // 111
        </temppate>
    </Child> // 子组件
</template>

```
## Vue组件通信方式

#### 父-子之间通信
##### 1.props和$emit

这种方式是我们日常开发中应用最多的一种方式。

props以单向数据流的形式可以很好的完成父子组件的通信

所谓单向数据流：就是数据只能通过 props 由父组件流向子组件，而子组件并不能通过修改 props 传过来的数据修改父组件的相应状态。
所有的 prop 都使得其父子 prop 之间形成了一个单向下行绑定：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。

额外的，每次父级组件发生更新时，子组件中所有的 prop 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。

正因为这个特性，于是就有了对应的emit。$emit 用来触发当前实例上的事件。对此，我们可以在父组件自定义一个处理接受变化状态的逻辑，然后在子组件中如若相关的状态改变时，就触发父组件的逻辑处理事件。

##### 2.provide和inject

provide和inject是成对儿出现的，用于父组件向子孙组件传递数据，注意这是写的是子孙组件而不是子组件，我们都知道vue有$parent属性可以让子组件访问父组件。但孙组件想要访问祖先组件就比较困难。通过provide/inject可以轻松实现跨级访问父组件的数据。

```javascript
// 父组件
new Vue({
    components: {
        //...
    },
    provide () {
        return {
            componentValue: '我是父组件的数据'
        }
    }
})
// 子组件
const ChildComponents = {
    ///....
    inject: ['componentValue'] // 我是父组件的数据
}
// 以上是伪代码.
```
##### 3.parent和children

children：是当前实例的直接子组件。需要注意 children 并不保证顺序，也不是响应式的。如果你发现自己正在尝试使用 children 来进行数据绑定，考虑使用一个数组配合 v-for 来生成子组件，并且使用 Array 作为真正的来源。因为是数组，所以我们可以通过比如：this.$children[2]来拿到第三个子组件的数据。
但是这么做有一个问题：比如开发时突然在这三个子组件中又插入了一个子组件（可能相同，也可能不同），这时候[2]就不再是我们需要的了，所以我们可以用vue-DOM之光：ref来获取相应组件来进行下一步操作。

parent：当前组件树的根 Vue 实例。如果当前实例没有父实例，此实例将会是其自己。

#### 兄弟组件之间通信
##### 1.EventBus-中央事件总线

如果想实现兄弟组件之间进行通信，在项目规模不大的情况下，完全可以使用中央事件总线EventBus的方式。

EventBus通过新建一个Vue事件bus对象，通过bus.$emit触发事件,bus.$on监听触发的事件。

```javascript
// 首先在main.js 中定义EventBus对象，其实就是一个全新的Vue实例：
// main.js
import Vue from 'vue'
import App from './App'

export const EventBus = new Vue()

new Vue({
    el: '#app',
    render: h => h(App)
})

// child1

// do some

<script>
    import { EventBus } from '../main.js'
    // ... code
    methods: {
        sayHello() {
            EventBus.$emit('sayHello', '你瞅啥呢～')
        }
    }
</script>

// child2

// do some

<script>
    import { EventBus } from '../main.js'
    // ... code
    methods: {
        sayHello() {
            EventBus.$emit('sayHello', '你瞅啥呢～')
        }
    }
    created() {
        EventBus.$on("sayHello", message => {
            console.log(message) // 你瞅啥呢～
        });
    }
</script>

// 反之，child2向child1传递消息是一样的
```

##### 2.使用vuex进行兄弟组件之间通信

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。用于存放一些全局共享的数据，存储在vuex中的数据都是响应式的，能够实时的保持数据与页面的同步。

```javascript
// store.js文件
import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)


// main.js
import store from './store/store'
// ...
new Vue({
    el: '#app',
    router,
    store, //将数据源挂载到vue实例上面
    render: h => h(app)
})
```

vuex的核心概念：
1. State：提供唯一的数据源，所有共享数据统一放到Store的state中进行存储。
```javascript
export default new Vuex.Store({
    state: {
        // 数据初始值
        name: 'vuex'
    }
})

// 访问state的方法：
// 方法1:直接在组件中访问store实例，注意在template中可以省略
console.log(this.$store.state.name) // vuex
<div>{{ $store.state.name }}</div>
// 方法2: 使用vuex提供的映射函数进行访问
<script>
    import { mapState } from 'vuex'
    //.. some code
    computed: {
        ...mapState(['name']) // vuex
    }
</script>
```
在vuex中不允许组件修改全局数据，所以在组件中写改变全局数据的做法不可取。所以我们看下面专门修改state数据的Mutation以及Action。

2. Mutation：用于修改Store中的数据，只能通过mutation修改store中的数据，这种方式虽然看起来稍微繁琐一些，但是可以集中监控所有数据的变化。

```javascript
// store.js
export default new Vuex.Store({
    state: {
        // 数据初始值
        name: 'vuex'
    },
    mutations: {
        changeName(state) {
            // do some 
            state.name = 'vue 666'
        }
    }
})
```
只有mutations里面的函数才有权利去修改state中的数据，当数据有问题可以直接从mutations里面去查看，在组件中不要去直接修改数据。在组件中我们可以通过commit去触发mutations里面的函数，从而达到修改数据的目的。(mutations里面函数的第一个形惨必须是自身的state)

```javascript
// store.js
export default new Vuex.Store({
    state: {
        // 数据初始值
        name: 'vuex'
    },
    mutations: {
        changeName(state, newName) {
            // do some 
            // 第一个参数必须是state， 后面才是我们传过去的参数
            state.name = newName
        }
    }
})


// 触发mutations的方法同样有俩种：
// 方法1:
this.$store.commit('changeName', 'vue666')
// 方法2:
<script>
    import { mapState, mapMutations } from 'vuex'
    //.. some code
    methods: {
        goChangeName() {
            this.changeName('vue666')
        },
        ...mapMutations(['changeName']) // vuex
    }
</script>
```
mutations中不能写异步代码，比如setTimeout异步函数，一旦写了，vue的调试工具就不能正常工作。所以看下面异步修改数据的方法Action。

3. Action：用于处理异步任务，如果通过异步操作修改state数据，必须通过action，而不能使用mutation，但是在action中还是通过触发mutation的方式间接变更数据。

```javascript
// store.js
export default new Vuex.Store({
    state: {
        // 数据初始值
        name: 'vuex'
    },
    mutations: {
        changeName(state, newName) {
            // do some 
            state.name = newName
        }
    },
    actions: {
        changeNameAsync(context, newName) {
            setTimeout(() => {
                context.commit(changeName, newName)
            },1000)
        }
    }
})

// 触发actions的方式同样是2种
// 方法1:
this.$store.dispatch('changeNameAsync', 'vue666')

// 方法2:
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    //.. some code
    methods: {
        goChangeName() {
            this.changeName('vue666')
        },
        goChangeNameAsync() {
            this.changeNameAsync('vue666')
        },
        ...mapMutations(['changeName']) // vuex
        ...mapActions(['changeNameAsync'])
    }
</script>
```

4. Getter：用于对store中的数据进行加工处理形成新的数据类似于计算属性，state中的数据发生变化，getter数据也会跟着变化。注意：getter不会修改state数据，只起到一个包装的作用。Getter使用方法与mutations大致相同这里就不写伪代码了。

###### Vuex数据持久化存储解决方案
在使用vuex的时候，当浏览器刷新的时候state中存储的数据会被浏览器释放掉，因为state中的数据都是存储在内存中的，所以一刷新就会被重置，所以我们就需要解决数据持久化的问题。一般的解决方式是通过第三方库来解决：

vuex-persistedstate 这个库就很不错：

```javascript
// npm install之后
import createPersistedState from 'vuex-persistedstate'
const VuePersistedState = new createPersistedState({
    storage: window.sessionStorage, // 这里选择浏览器存储方式
    reducer: (state) => ({...state}) // 要存储的数据
})

export default new Vuex.Store({
    state: {
        // 数据初始值
        name: 'vuex'
    },
    plugins:[VuePersistedState.plugin]
})

// 另一种方案就是自己写存储数据的方法和获取数据的方法，统一管理
```

##### 3.通过共同的父组件进行通信

## Vue Router

### Vue Router路由模式
vue 中路由分为俩中模式，分别是hash模式和history模式：
```javascript
const router = new VueRouter({
    mode: 'hash', //默认是hash模式，可选history模式，abstract模式(不在浏览器的情况下，node中)
    routes: [...]
})
```

hash模式：hash就是地址栏中的 # 符号，它的特点在于hash虽然出现在url中，但是不会被包括在http请求中，对后端完全没有影响，因此修改hash值不会重新加载页面。hash的每一次改变，都会在浏览器访问历史中增加一个记录，我们可以为hash改变添加监听事件：
```javascript
window.addEventListener('hashchange',funRef,false)
```
history模式：利用了 HTML5 History Interface 中新增的 pushState() 和 replaceState() 方法。（需要特定浏览器支持）这两个方法应用于浏览器的历史记录栈，在当前已有的 back、forward、go 的基础之上，它们提供了对历史记录进行修改的 功能。只是当它们执行修改时，虽然改变了当前的 URL，但浏览器不会立即向后端发送请求。
histort指向浏览器History对象，它表示当前窗口浏览历史，出于安全考虑，我们无法去读取这些地址，但是允许在地址之间导航，History对象主要有俩个属性：History.length 和 History.state。
它提供了一些方法：History.back()、History.forward()、History.go()，以及H5新加的俩个放方法 pushState() 和 replaceState()

pushState(): 向记录中添加一条记录，pushState()方法不会触发页面刷新，只是导致 History 对象发生变化，地址栏会有反应。使用该方法之后，就可以用History.state属性读出状态对象。 

replaceState()：replaceState()方法用来修改 History 对象的当前记录，其他都与pushState()方法一模一样。

popstate事件：每当同一个文档的浏览历史（即history对象）出现变化时，就会触发popstate事件。注意，仅仅调用pushState()方法或replaceState()方法 ，并不会触发该事件，只有用户点击浏览器倒退按钮和前进按钮，或者使用 JavaScript 调用History.back()、History.forward()、History.go()方法时才会触发。另外，该事件只针对同一个文档，如果浏览历史的切换，导致加载不同的文档，该事件也不会触发。页面第一次加载的时候，浏览器不会触发popstate事件。

### Vue-Router 组件都有哪些

#### 1. `router-link`：实现路由之间的跳转。

```javascript
// 1
// localhost:8080/#/test?name=vue666
<router-link :to="{ 
    path: '/test', query: { name: 'vue666' } 
}" >跳转</router-link>
console.log(this.$route.query.name) // vue666

// 2
// localhost:8080/#/test/1
<router-link :to=" '/test/' + id ">跳转</router-link>
(id是参数）
// 这种方式需要路由配置
// route.js
{ 
   path:'/test/:id',
   name:'test',
   component: testComponents
}
console.log(this.$route.params.id) // 1
```
注意：router-link中链接如果是‘/’开始就是从根路由开始，如果开始不带‘/’，则从当前路由开始。

routerlink中的props:
1. to：表示目标路由链接，点击后会把值传到`router.push()`。
2. replact：设置`replacr`属性的话，当点击时，会调用`router.replace()`而不是`router.push()`，所以不会留下history记录。
3. append：设置`append`属性后，则在当前（相对）路径下添加基路径，例如我们从 `/a` 导航到 `/a/b`，就需要设置`append`属性。
4. tag：有时候想要`router-link`渲染成某种标签，例如`li`，我们可以使用这个属性，同样会监听点击，触发导航。`<router-link :to="/test"  tag="li">Test</router-link>`
5. active-class：设置激活时使用的css，默认值可以通过路由的构造选项`linkActiveClass`来全局配置。

还有一些其他的属性，有兴趣可以官网看看。


#### 2. `router-view`：路由匹配后显示视图。
#### 3. `keep-alive`：能够在路由切换后保存组件状态，防止重新渲染DOM。
`keep-alive`属性：
1. include： 接受一个字符串或者正则表达式，匹配到的组件会被缓存。
2. exclude：同include参数一致，但是效果是匹配到的组件不会被缓存。

有一个很常见的用法就是通过配合路由配置meta属性来设置路由出口的组件是否需要被缓存(不会调用destroyed)：
```javascript
{
    path: '/a',
    name: 'a',
    component: a,
    meta: { keepAlive: true }
}
<keep-alive> 
    <router-view v-if="$route.meta.keepAlive" > </router-view>
</keep-alive>

<router-view v-if="!$route.meta.keepAlive" > </router-view>
```
当 `router-view` 被 `keep-alive` 包裹时，会有俩个钩子函数会生效：
1. activated：被 keep-alive 缓存的组件激活时调用，可以被回调。先created再activated。
2. deactivated： 被 keep-alive 缓存的组件停用时调用，此时的this.$route.path指向激活的路径

### vue-router的导航守卫

#### 1. 全局前置守卫：`router.beforeEach`

```javascript
const router = new VueRouter({...})
router.beforeEach((to, from, next) => {
    // to: 即将要进入的路由 路由对象
    // from: 当前导航正要离开的路由
    // next: 这是个函数，一定要调用这个方法来resolve这个钩子
    // next函数可以进行指定路由跳转
    next('/login')// 去登录页面
    next({path:'/login',query:{...}}) // 也可以携带参数
})
```

#### 2. 全局后置守卫： `router.afterEach`
```javascript
const router = new VueRouter({...})
router.afterEach((to, from) => {
    // to: 即将要进入的路由 路由对象
    // from: 当前导航正要离开的路由
})
```
#### 3. 路由独享守卫
```javascript
{
  path: '/login',
  component: Login,
  beforeEnter: (to,from,next) => { //路由独享守卫 前置 
    // to: 即将要进入的路由 路由对象
    // from: 当前导航正要离开的路由
    // next: 初步认为是需要展示的页面，是否显示
    next()//直接进to 所指路由
    next(false) //中断当前路由
    next('route') //跳转指定路由
    next('error') //跳转错误路由
  }
}
```
#### 组件内部守卫
```javascript
//组件内部钩子
beforeRouteEnter (to, from, next) {//前置
  // 不能获取组件内部this，因为当守卫执行前，组件实例还没被创建
  // 如需给修改data数据 
  next(vm =>{
    // vm 为当前组件实例
  })
},
beforeRouteUpdate (to, from, next) {
  // 在当前路由改变，但是该组件被复用时调用
  // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
  // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
  // 可以访问组件实例 `this`
},
beforeRouteLeave (to, from, next) {//后置
  // 导航离开该组件的对应路由时调用
  // 可以访问组件实例 `this`
}
```

## Vue常被问到的问题：

### Vue中 watch 和 computed的使用以及区别：

#### watch
watch的作用是监听一个值的变换，并调用因变换需要执行的某些方法，当属性发生变化时，就会触发相应的函数，函数会接受到俩个值，一个是属性变化后的新值，一个是属性变化前的旧值。

```javascript
new Vue({
    el: '#app',
    data: {
        userName: 'w',
        userInfo: {
            age: 18,
            sex: 'man'
        }
    },
    watch: {
        userName (nval,oval) {
            console.log('我以前叫',oval) // w
            console.log('我的新名字:',nval) // ？
        } 
    },
})
//  当userName 通过某些操作发生变换时， watch会监听到变换并执行函数 ⬆️ // w // ?
```
这样使用watch有一个特点，就是值第一次绑定的时候，不会执行监听函数，只有值发生变换时才会执行，如果我们需要在第一次绑定的时候就去执行监听函数的话，就需要用到`immediate`属性：
```javascript
new Vue({
    el: '#app',
    data: {
        userName: 'w',
        userInfo: {
            age: 18,
            sex: 'man'
        }
    },
    watch: {
        userName:{
            handler(nval,oval) {
                console.log('我以前叫',oval) // w
                console.log('我的新名字:',nval) // ？
            },
            immediate:true
            //immediate表示在watch中首次绑定的时候，是否执行handler
            //值为true则表示在watch中声明的时候就执行handler，反之与默认情况一样
        },

    },
})
```
我们都知道watch可以监听data中属性的变换，但是如果属性是一个对象的话，平常的方法我们是监听不到的，这时候可以使用deep属性来监听对象的变化：
```javascript
new Vue({
    el: '#app',
    data: {
        userName: 'w',
        userInfo: {
            age: 18,
            sex: 'man'
        }
    },
    watch: {
        userInfo:{
            handler(nval,oval) {
                console.log('我以前',oval.age+'岁') // 18
                console.log('我现在:',nval.age+'岁') //  ?
            },
            deep:true,
        },
    },
})
// 虽然这样可以监听到对象的变化了
// 但是这样做会给userInfo每个属性都加上这个监听器，当我们只想监听对象中的某一项的时候
// 可以使用字符串的形式监听对象某一个属性：
watch: {
    'userInfo.age':{
        handler(nval,oval) {
            console.log('我以前',oval.age+'岁') // 18
            console.log('我现在:',nval.age+'岁') //  ?
        },
        deep:true,
    },
},

// 扩展延伸：监听对象属性，通过与computed配合也可以实现
new Vue({
    el: '#app',
    data: {
        userName: 'w',
        userInfo: {
            age: 18,
            sex: 'man'
        }
    },
    computed: {
        getAge () {
            return this.userInfo.age
        }
    }
    watch: {
        getAge:{
            handler() {
                // code...
            },
        },
    },
})

// watch还可以监听到路由的变换
watch: {
    '$route.path': (nval,oval) {
        // code...
    }
}

//或者这样
watch: {
    $route(to,from) {
        // code...
    }
}
```

### Vue中数组以及对象增删无法触发响应式的问题

#### 数组
Vue中包含了一组观察数组的变异方法，所以它们是可以触发视图更新的，方法： `push()`,`pop()`,`shift()`,`unshift()`,`splice()`,`sort()`,`reverse()`。
但是有些情况下vue是无法检测到数组变化并进行视图更新的：
1. 当我们利用数组索引来修改数据，arr[index] = 'new value'。

这种情况我们可以用Vue.set(arr,index,newvalue) 这种方式来解决，或者是arr.splice(index,1,newvalue)。

2. 当修改数组长度时，arr.length = newLength

这种情况可以这样解决 arr.splice(newlength)

#### 对象
由于javascript的限制，Vue不能检测到对象属性的添加或者删除，对于这种情况我们可以使用`Vue.set`来解决，或者是使用`Object.assign`来进行对象替换

### delete和Vue.delete删除数组的区别
delete只是被删除的元素变成了 empty/undefined 其他的元素的键值还是不变。

Vue.delete 直接删除了数组 改变了数组的键值。