<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-19 18:39:49
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-19 18:39:49
 * @FilePath: /knowledge-summaryp-review/src/files/JavaScript/JavaScript热点面试题.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
#### 数据类型

1. JS 有几种基础数据类型？哪几种新增的？

JS 有 7 种基础数据类型：undefined null boolean string number | 新增 symbol bigInt

symbol：独一无二且创建后不可修改，一般用于解决全局变量冲突，内部变量防止覆盖

bigIng：任意精度正数，安全的存储和操作大数据，即便超出了 number 的安全整数范围

2. 数据类型通常会如何进行分类？使用起来有什么区别？使用过程中如何区分他们？

可以分为：原始数据类型 + 引用数据类型

原始数据类型：undefined null number string boolean symbol bigInt
引用数据类型：object function array 等

存储位置不同：
栈：原始数据类型，先进后出结构特征，栈由编译器自动分配释放，临时变量方式
堆：引用数据类型，堆内存，由开发者进行分配，如果不主动释放会一直存储在内存中，直到应用结束
原始数据类型存储在栈中，空间大小固定，操作频繁
引用数据类型存储在堆中，大小不固定，赋值时赋值的是引用地址

#### 类型转换

1. isNaN 和 Number.isNaN 的区别？

isNaN 包含了一个隐式转换
isNaN：尝试将参数转为数值类型，不能被转换的返回 true，非数字值传入返回 true
Number.isNaN 则不会进行数据类型转换，接受参数，判断参数是否为数字 => 判断是否为 NaN

2. 类型转换场景

转换成字符串：
Null 和 Undefined => 'null' 'undefined'
Boolean => 'true' 'false'
Number => '数字' 大数据会转换成带指数的形式
Symbol => '内容'
普通对象 => '[Object Object]'

转换成数字：
Undefined => NaN
Null => 0
Boolean => true -> 1 false -> 0
String => 包含非数字的值 ->NaN 空 -> 0
Symbol => 报错
对象 => 相应的基本值类型 -> 相应的转换

转换成 Boolean：
undefined | null | false | +0 -0 | NaN | "" => false

#### ES6

1. const 对象的属性可以修改吗？ new 箭头函数会怎么样？

const 只能保证指针式固定不变的，指向的数据结构属性，无法控制是否变化的

new 执行全过程：
创建一个对象，构造函数作用域赋值给新对象，指向构造函数后，构造函数中的 this 指向该对象，最后返回新对象

箭头函数没有 prototyp，也没有独立的 this 执行，更没有 arguments。

2. JS ES 内置对象有哪些？

全局对象
值属性类：Infinity isNaN Undefined Null...
函数属性：eval() ParseInt()...
对象：object function Boolean...
...

#### 原型 & 原型链

1. 简单说说原型原型链理解？

构造函数：
JS 中用来新建构造一个对象的函数

构造函数内部有一个属性叫 prototype => 值是一个对象 -> 包含了共享的属性和方法

使用构造函数创建对象后，对象内部会存在一个指针（**proto**） => 指向构造函数 prototype 属性的对应值

链式获取属性的规则：
对象的属性 => 对象内部本身是否包含该属性 => 如果不存在顺着指针去原型对象里查找 => 如果原型对象还不存在则会再往上查找，这样的链式查找规则就是原型链

#### 异步编程

1. 聊聊遇到哪些异步执行方式？

回调函数 => cb 回调地狱
promise => 链式调用 => 语意不明确
generator => 考虑如何控制执行 co 库
async await => 不改变同步书写习惯的前提下，进行异步处理

#### 内存 & 浏览器执行问题

1. 简单说说堆垃圾回收机制的理解？

垃圾回购概念：js 具有自动垃圾回收机制，找到不再使用的变量，释放其占用的内存空间
