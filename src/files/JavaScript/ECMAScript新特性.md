<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-19 18:40:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-19 18:40:02
 * @FilePath: /knowledge-summaryp-review/src/files/JavaScript/手写系列/ECMAScript新特性.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
#### 变量定义新形式

- let：let 关键字声明一个块级作用变量，只在代码块中有效。
- const：const 声明一个块级作用常量，声明后必须赋值初始值，且后续无法修改。
- 暂存性死区：声明块级作用域前使用声明的变量，会导致暂存性死区的出现，报错。

1. 深入理解原理

let 变量声明原理分为四步：

- compile：编译，扫描变量，生成词法环境并保存至作用域链中
- 进入执行上下文：当进入块级作用域，for if 等块级语句后，会创建一个新的词法环境。
- 绑定变量值：运行到当前变量时，js 引擎会在当前词法环境中搜索该变量，查找作用域链，如果找到全局作用域还没有找到，会是 undefined
- 实现块级作用域：使用块级作用域时，运行时不会在当前作用域外创建单独的执行上下文，而是会创建遮蔽(shadowing)新环境，在子遮蔽的词法环境中，变量的值只在最接近的块级作用域内有效。

const 变量声明原理：const 具有与 let 相同的底层实现原理，区别在于 const 定义的变量被视为常量，赋值之后无法改变，因此变量声明时，必须初始化。此外，应该注意的是，使用 const 声明的对象是可以修改属性的，在定义 const 对象时，对象本身是常量，而不是对象的属性，只有对象本身不能被修改，而对象包含的属性可以任意修改。

#### 面向对象编程 - class 语法

JavaScript 的类，最终也是一种函数，class 语法只是语法糖，使用 class 关键字创建的类会被编译成一个函数，因此底层实现原理与函数有一些相似之处。

使用 class 定义的对象，无法使用 for in 枚举实例对象的属性和方法。

1. class 语法继承语法，实现原理

2. 注解

#### 模板字符串

底层实现原理：js 引擎会将模版字符串解析成一个函数调用表达式，接着这个表达式会执行，并输出一个字符串

对于第一步，当 js 引擎解析模板字符串时，会将特殊字符串和变量值分割成多个参数，并将他们作为函数调用的参数传递给一个名为 Tagged Template 的函数，该函数的第一个参数是一个数组，包含原始字符串中的所有字符文字，除所有插入值之外，其余参数则是与模板字符串插值表达式相对应的插入值。

```js
// 模拟实现简单的taggedTemplate函数
const tagFun = (temp, ...args) => {
	let str = "";
	for (let i = 0; i < temp.length; i++) {
		str += temp[i] + args[0];
	}
	return str;
};
```

#### 解构语法

#### 箭头函数的原理与使用场景

箭头函数也被称为词法作用域函数，this 关键字的作用域与它周围代码作用域相同

不能使用箭头函数的场景：

1. 不能用做构造函数
2. 不能使用 arguments 关键字
3. 不能通过 call，apply，bind 等关键字修改 this 指向

#### 生成器 generator

JavaScript 中的生成器，引入的一种函数类型，与传统函数区别在于，在生成器中，可以中途停止函数运行，并保存其上下文信息，下次继续执行时可以获得保存的上下文信息后续使用

```js
// 定义 加个*
function* test() {
	yield 1; // 遇到yield关键字后，停止函数执行，并将yield后面的值作为返回值返回
	yield 2;
	yield 3;
}
const testF = test();
let v1 = testF.netx().value;
console.log(v1); // 1
```

#### 异步处理 - callback Promise async & await

最早是 callback，有回调地狱问题
Promise 其实还时没有很好的解决嵌套过多的问题
co Promise + generator 实现
async & await 解决

#### Reflect 反射

JavaScript 反射，是一种能够在运行时检查，修改对象，类和函数等程序结构的能力，通过反射，我们可以读取和修改对象属性，调用对象的方法，定义新属性，修改原型等。

JavaScript 通过 Reflect 对象提供了一组操作对象的 API，可以访问，检查和修改对象的属性和方法。

```js
// 获取对象属性名称列表
const obj = { a: 1, b: 2, c: 3 };
console.log(Reflect.ownKeys(obj)) // ["a", "b", "c"];
...

```

#### BigInt
