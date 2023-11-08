## JavaScript篇
### JavaScript 基础数据类型：
1. 基本数据类型：string, number, null, boolean, undefined, symbol(Es6新增数据类型，有己的实例，具有唯一性，无法使用如Object.keys或者for..in等方式来枚举，常用来定义一些常量或者私有属性。
2. 引用数据类型：object, array, function(统称为object)
引用数据类型：javascript中引用数据类型是保存在内存栈中的对象，不能直接操作内存栈中的对象，只能操作对象在内存中的引用地址，所以，引用数据类型在栈中保存的实际是对象在堆内存中的引用地，通过这个地址可以快速查找到保存到内存的对象。总结区别：（基本数据类型和引用数据类型）

    a) 声名变量是不同的内存分配：
   1. 原始值：存储在栈内存中的简单数据，也就是说，他们的值是直接存储在变量访问的位置。
   2. 引用值：存储在堆内存中的对象，也就是说，存储在变量处的值是一个指向堆内存的指针。这是因为引用值的大小会改变，所以不能放到栈中，否贼会降低变量查询速度，相反，放在变量栈中是一个地址，地址的大小是固定不变的，所以没有负面影响。

    b) 不同的内存分配机制也带来了不同的访问机制：
   1. 在javascript中是不允许直接访问保存在堆中的对象的，所以在访问时，首先得到这个对象
   在堆中的地址，然后按照这个地址去获得这个对象中的值，也叫按引用访问。
   2. 原始值是可以直接访问的。
### 数据类型检测：
typeof：对于基本数据来说，除了null都可以显示正确的类型，typeof对于对象来说，除了函数都会
显示object。
```javascript
typeof 5 // number
typeof 'str' //string
typeof undefined // undefined
typeof Symbol // symbol
console.log(typeof null) // object
console.log(typeof NaN) // number
typeof [] // object
typeof {} // object
typeof console.log // function
```
instanceof：通过原型链来判断数据类型的
```javascript
Function Dog() {}
const hunter = new Dog()
hunter instanceof Dog // true
```
Object.prototype.toString.call()可以检测出所有数据类型
```javascript
const obj = {}
const arr = []
console.log(Object.prototpye.toString.call(obj)) // [object Object]
console.log(Object.prototype.toString.call(arr)) // [object Array]
```

### 深浅拷贝：
浅拷贝：浅拷贝是指拷贝了目标对象的引用地址，所以浅拷贝后，改变值之后另一个也会跟着改变，不懂引用去⬆️⬆️⬆️ look look～

Object.assign()  ES6中的方法，也是比较常用的一个方法
Object.assign会合并对象生成一个新对象。如果对象的属性是普通类型改变之后新对象不会改变，如果引用类型改变后新对象也会改变，所以Object.assign实际上还是浅拷贝。
```javascript
let obj = { name: '牛马', age: 18 };
let obj1 = Object.assign({}, obj)
obj.name = '牛马二号'
console.log(obj1.name) // 牛马二号
// Tips：实用场景
state = {
    params: {
        pageSize: 10,
        pageNumber: 1
    }
}
// react中当我们一个对象中有许多数据确只想改一个某一个的时候
handle = (pageNumber) => {
    this.setState({ params: Object.assign(this.state.params, { pageNumber }) })
}
```

深拷贝：与浅拷贝相反，是将拷贝对象完全复制一份儿，俩人互不相干。
JSON.parse(JSON.stringify(obj))，利用JSON.stringify(obj)将对象先转为json字符串，再JSON.parse(）转回为json对象可以实现深拷贝，这也是比较常用的一种方法。（无法实现对象中的方法拷贝）

用javascript实现深拷贝：其实深拷贝可以拆分成2步，浅拷贝+递归，浅拷贝判断属性是否为对象，如果是对象就进行递归，俩者结合就实现了深拷贝。
```javascript
function deepClone (target) {
    if(typeof target === 'object' && target !== null) {
        let _t = Array.isArray(target) ? [] : {};
        for ( const key in target ) {
            if(target[key] === 'object' && target !== null) {
                _t[key] = deepClone(target[key]);
            }
            else {
                _t[key] = target[key];
            }
        }
    }
    else {
        return target;
    }
    return target;
}
// ps: 这可能是不最精版本，但是思路就是这样～，写错了请打醒我！！！
```

### 作用域
 
简单的理解作用域就是一块独立的地盘，让变量不会暴露出去，也就是说作用域最大的用处就是隔离变量。ES6之前js只有全局作用域和函数作用域，没有块级作用域的概念，ES6到来为我们提供了块级作用域，let和const。
 
#### 作用域链：
当我们在访问某个变量时，会在当前作用域进行查找，如果当前作用域没有的话会到父作用域中区查找，这样的一个层级关系就时作用域链，一值找到全局作用域还没找到的话就undefined了。

由作用域和作用域链我们可以引出一个闭包的概念：广义的定义闭包是指 函数 和 函数内部可以访问的变量的总和，就是一个闭包，在javascript高级程序设计中这样描述闭包：闭包是指有权访问另一个函数作用域中变量的函数。
 ```javascript
 function fun1 () {
    var s = 1;
    function fun2() {
        console.log(s)
    }
    return fun2
 }
 const fun = fun1()
 fun()
 ```
    
这就是一个简答的闭包，闭包的作用：常常用来「间接访问一个变量」。换句话说，「隐藏一个变量」。
    
#### 变量声明提升：

1. 在js中，函数声明和变量声明，经常被js引擎隐式的提升到当前作用域的顶部
```javascript
function fun() {
    var a = 1;
}
var b = 2;
// 提升后
function fun () {
    var a;
    a = 1
}
var b; 
b = 2;
```
值得一提的是，函数的声明等级高于变量，意思是如果变量名与函数名相同且未赋值，则函数声明会覆盖变量声明

2. 声明语句中的赋值部分不会被提升，只有变量名提升。

####  var，let，const的区别：

 1. var的声明会挂载到window上，而let与const不会
```javascript
var a = 10;
console.log(a,window.a) // 10 10
let b = 20;
console.log(b, window.b) // 20 undefined  const一样
```
2. ES6规定如果块内存在let/const命令，那么这个块就会成为一个封闭的作用域，并要求const、let变量先声明才能使用，如果在声明之前就开始使用，它并不会引用外部的变量。
3. 同一作用域下let和const不能声明相同变量名，var可以。

暂存死区：指的是在当前作用域下，使用let/const声明了变量，但是给变量赋值时在未声明变量之前，会形成暂存死区。
```javascript
 if(true) {
    a = 10;
    let a = 1; //ReferenceError: Cannot access 'a' before initialization
 }
```
总结：
    
    let 的「创建」过程被提升了，但是初始化没有提升。
    var 的「创建」和「初始化」都被提升了。
    function 的「创建」「初始化」和「赋值」都被提升了。

### 原型/原型链
原型链指的是：在一个实例的属性中去找某个属性，如果没有的话就会去当前实例的原型对象上去寻找，一只寻找到Object，这样的一个链式查找关系叫做原型链

    作用域链与原型链的区别：
    作用域链是相对于变量而言， 原型是相对于属性而言
    作用域最顶层是window ，原型链最顶层是Object

#### new和this

new操作符到底干了什么？

1. 首先是创建实例对象 {}。
2. this变量引用该对象，同时还继承了构造函数的原型。
3. 其次属性和方法被加入到this引用的对象中。
4. 并且新创新创建的对象由this所引用，最后隐式的返回this。

new的模拟实现：
```javascript
function objectNew() {
    let obj = new Object();
    Constructor = [].shift.call(argumments); // 获取外部传入的构造器
    
    const F = function () {};
    F.prototype = Constructor.prototype;
    obj =  new F(); // 指向正确的原型
    const ret = Constructor.apply(obj, arguments);
    return typeof ret === 'object' ? ret : obj; //确保返回的是一个对象
}
```

#### 对于this对象的理解

普通函数：

1. this总是指向函数的直接调用者
2. 如果有new关键字，this指向new出来的实例对象
3. 在事件中，this指向出发这个事件的对象
4. IE下attachEvent中的this指向全局对象window
5. 在箭头函数中，函数体内的this，就是定义时所在的作用域对象，而不是使用时所在的作用域对象。

箭头函数和普通函数的区别：

1. 箭头函数没有自己的this，它的this取决于定义时所在作用域的this，且任何方法都改变不了其指向，例如apply()，call()，bind()
2. 箭头函数时匿名函数，不能作为构造函数，不能使用new操作符号
3. 箭头函数不能绑定arguments 取而代之用reset参数(...)解决
4. 箭头函数使用call()或者apply()方法调用一个函数时，只传入了一个参数，对this没有影响
5. 箭头函数没有原型属性
6. 箭头函数不能当作Generator函数，不能使用yield关键字

#### call()，apply()，bind()

call,apply,bin都是Function对象自带的三个方法，都是为了改变函数内部this的指向。它们三个的第一个参数都是this要指向的对象，call和apply是立即调用函数，而bind是返回对应的函数，便于稍后调用。call传入参数列表call(obj,s1,s2,s3)，apply是传入数组paaly(obj,[s1,s2,s3])

### Event Loop(事件循环)

#### 宏任务/微任务

除了广义的定义同步任务和异步任务外，我们对任务有更加精确的定义：

1. 宏任务：当前调用栈中执行的任务称为宏任务，包括: script全部代码，setTimeout,setInterval,I/O等。
2. 微任务：当前(此次事件循环中)宏任务执行完，在下一个宏任务开始之前需要执行的任务为微任务。包括Promise,Process.nextTick(node独有),MutationObserver
3. 不同类型任务会进入对应的Event Queue，宏任务中的事件放在callback queue中，由事件触发线程维护，微任务的事件放在微任务队列中，有js引擎线程维护。

事件循环流程：

主线程执行时会生成堆和栈，js从上到下进行解析，将其中同步任务按照执行顺序放入执行栈中，当遇到异步任务时，会将此类任务挂起，继续执行栈中的任务，等异步任务返回结果后，再按照顺序排列到事件队列中。

主线程先将执行栈中的同步任务清空，然后检查事件队列中是否有任务，如果有，就拿出第一个事件对应的回调推到执行栈中执行，若在执行过程中遇到异步任务，则继续将异步任务当道事件队列中，这一系列反复循环的过程就叫做事件循环。

### 浏览器页面渲染过程

1. 浏览器解析html代码，然后创建dom树，并请求css/image/js，在dom树中，每一个html标签都有一个对应的节点，并且每一个文本也都会有一个对应的文本节点。dom树的根结点就是documentElement，对应的的html标签。
2. 浏览器解析CSS代码，计算出最终的样式数据。构建CSSOM树。对CSS代码中非法的语法它会直接忽略掉。解析CSS的时候会按照如下顺序来定义优先级：浏览器默认设置 < 用户设置 < 外链样式 < 内联样式 < html中的style。
3. DOM Tree + CSSOM --> 渲染树（rendering tree）。渲染树和DOM树有点像，但是是有区别的。DOM树完全和html标签一一对应，但是渲染树会忽略掉不需要渲染的元素，比如head、display:none的元素等。而且一大段文本中的每一个行在渲染树中都是独立的一个节点。渲染树中的每一个节点都存储有对应的css属性。
4. 一旦渲染树创建好了，浏览器就可以根据渲染树直接把页面绘制到屏幕上。

以上四个步骤并不是一次性顺序完成的。如果DOM或者CSSOM被修改，以上过程会被重复执行。实际上，CSS和JavaScript往往会多次修改DOM或者CSSOM。

#### 浏览器回流和重绘：

回流：当render tree中的一部分(或全部)因为元素的规模尺寸，布局，隐藏等改变而需要重新构建。这就称为回流(reflow)。每个页面至少需要一次回流，就是在页面第一次加载的时候，这时候是一定会发生回流的，因为要构建render tree。在回流的时候，浏览器会使渲染树中受到影响的部分失效，并重新构造这部分渲染树，完成回流后，浏览器会重新绘制受影响的部分到屏幕中，该过程成为重绘。

重绘：当render tree中的一些元素需要更新属性，而这些属性只是影响元素的外观，风格，而不会影响布局的，比如background-color。则就叫称为重绘。

他们的区别很大：
回流必将引起重绘，而重绘不一定会引起回流。比如：只有颜色改变的时候就只会发生重绘而不会引起回流
当页面布局和几何属性改变时就需要回流
比如：添加或者删除可见的DOM元素，元素位置改变，元素尺寸改变——边距、填充、边框、宽度和高度，内容改变

### 浏览器缓存

浏览器缓存分为强制缓存和协商缓存
1. 浏览器在加载资源时，先根据这个资源的一些http header 来判断它是否命强缓存，强缓存如果命中，浏览器直接从自己的缓存中读取资源，不会发送请求到服务器。
2. 当强缓存没有命中时，浏览器一定会发送一个请求到服务器，通过服务器依据资源的另外一些 http header验证这个资源是否命中协商缓存，如果协商缓存命中，服务器会将这个请求返回，但是不会返回资源数据，而是告诉客户端(状态码304)可以直接从缓存中加载这个资源。
3. 强缓存和协商缓存的共同点是：如果命中，都是从客户端缓存中加载资源，而不是从服务端加载资源数据，区别是强缓存不会发送请求，协商缓存会发请求

#### 强缓存原理：

强缓存是利用 Expires 或者 Cache-Control 这俩个http header实现的，它们都用来表示资源在客户端的有效期，当命中时会拿缓存中的时间和当前对比，如果未过期则时缓存命中。
1. Expires 和 Cache-Control 区别在于 Expires返回的是一个绝对时间，如果服务端和客户端时间相差较大，会出现问题。而 Cache-Control是一个相对时间，在进行缓存命中的时候，都是利用客户端时间进行判断。 所以 Cache-Control 相对来说更安全一些，这俩个header可以单独设置一个，也可以同时设置， Cache-Control 优先级高于 Expires

#### 协商缓存原理：
##### Last-Modified，If-Modified-Since控制协商缓存
1. 浏览器第一次跟服务器请求一个资源，服务器在返回这个资源的同时，在respone的header加上Last-Modified的header，这个header表示这个资源在服务器上的最后修改时间
2. 浏览器再次跟服务器请求这个资源时，在request的header上加上If-Modified-Since的header，这个header的值就是上一次请求时返回的Last-Modified的值
3. 服务器再次收到资源请求时，根据浏览器传过来If-Modified-Since和资源在服务器上的最后修改时间判断资源是否有变化，如果没有变化则返回304 Not Modified，但是不会返回资源内容；如果有变化，就正常返回资源内容。当服务器返回304 Not Modified的响应时，response header中不会再添加Last-Modified的header，因为既然资源没有变化，那么Last-Modified也就不会改变，这是服务器返回304时的response header
4. 浏览器收到304的响应后，就会从缓存中加载资源
5. 如果协商缓存没有命中，浏览器直接从服务器加载资源时，Last-Modified Header在重新加载的时候会被更新，下次请求时，If-Modified-Since会启用上次返回的Last-Modified值
##### ETag、If-None-Match控制协商缓存
1. 浏览器第一次跟服务器请求一个资源，服务器在返回这个资源的同时，在respone的header加上ETag的header，这个header是服务器根据当前请求的资源生成的一个唯一标识，这个唯一标识是一个字符串，只要资源有变化这个串就不同，跟最后修改时间没有关系，所以能很好的补充Last-Modified的问题
2. 浏览器再次跟服务器请求这个资源时，在request的header上加上If-None-Match的header，这个header的值就是上一次请求时返回的ETag的值
3. 服务器再次收到资源请求时，根据浏览器传过来If-None-Match和然后再根据资源生成一个新的ETag，如果这两个值相同就说明资源没有变化，否则就是有变化；如果没有变化则返回304 Not Modified，但是不会返回资源内容；如果有变化，就正常返回资源内容。与Last-Modified不一样的是，当服务器返回304 Not Modified的响应时，由于ETag重新生成过，response header中还会把这个ETag返回，即使这个ETag跟之前的没有变化
4. 浏览器收到304的响应后，就会从缓存中加载资源。

