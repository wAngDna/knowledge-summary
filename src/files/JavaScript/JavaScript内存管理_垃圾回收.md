<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-19 18:40:18
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-19 18:40:19
 * @FilePath: /knowledge-summaryp-review/src/files/JavaScript/JavaScript内存管理_垃圾回收.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
### 垃圾回收

引用计数 标记清除

#### 引用计数

当被引用时，+1，然后在内存回收时，看某个变量的计数是否为 0，为 0 则清除，当断开引用时，-1

```js
// 模拟
let count = 0;
let obj = { a: 1 };
// 变量obj 被引用
let ob = obj;
// 计数+1
count++;
// 变量引用被断开
ob = 2;
// 计数-1
count--;
// 内存回收时，计数为0
if (count === 0) {
	// 清除变量
	obj = null;
}
```

通过标记清除法，有时会出现引用无法断开情况，引用数量一直会是 1，导致变量无法被回收，解决办法就是手动断开引用，将对象指定为 null，这样引用就会断开，下次回收垃圾时会被清除

```js
function test() {
	let a = {};
	let b = {};
	// 变量互相引用时会出现无法断开引用问题
	a.b = b;
	b.a = a;
	// 解决办法就是手动断开引用
	a.b = null;
	b.a = null;
}
test();
```

#### 标记清除

分为标记 和 清除，垃圾回收过程可拆分为两步

1. 标记

当变量声明时，放入内存，并标记 1，变量断开引用时标记 0，变量重复引用时，计数只是 1，这里变量放入内存就是 1，不关注引用多少次，当变量断开引用时，就变为 0

2. 清除

标记为 0 的变量都清除掉

标记清除问题： 清理垃圾时，会出现内存碎片，内存不连续，V8 出现了标记整理

3. 标记整理

标记整理时，不仅清除垃圾，还会对垃圾进行分类，先将垃圾与正常变量分类（变量放前面，垃圾放后面），减少内存碎片，清除时只需要清除固定分类即可

#### V8 内存管理

分为新生代，老生代俩个区

- 新生代：分为空闲区，使用区(占用量达到 75%时，会将整个空闲区与使用区反转
  )
- 老生代：变量活跃 存活时间长的变量

分代机制是把一些新的，小的存活时间短的变量作为新生代，采用一小块内存频率较高的快速清理，而一些大的，老的存活时间长的对象作为老生代，使其很少接受检查，新老生代的回收机制以及频率是不同的，可以说此机制的出现很大程度上提高了垃圾回收效率。

#### 并行回收

JavaScript 单线程，所以在处理任务时，有可能会阻塞，React 做了时间切片，CPU 抢占，在主线程基础上，开辟子线程去处理
比如原来一个进程需要 3s，那么主线程会阻塞 3s，把整个 3s 的任务开辟 3 个子线程，则就需要 1s 来处理了

- 全停顿标记：可以理解为阻塞，同然通过并行回收减少了 GC 回收时间，但是主线程依然被长时间占用，所以出现了切片回收

- 切片回收：将任务进行切片处理，当线程空闲时，处理某个切片

#### 三色标记

三色：白色，灰色，黑色

- 白色：未被引用的对象
- 灰色：指自身被标记，成员变量（该对象的引用对象）未被标记
- 黑色：指自身和成员变量都被标记

1. 写屏障

2. 惰性清理
