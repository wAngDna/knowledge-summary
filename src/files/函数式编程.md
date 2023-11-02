# 1. 课程目标

1. 通过JavaScript了解函数式编程的完整实现；

# 2. 课程大纲

1. 基础介绍；
2. 一等公民的函数；
3. 纯函数的好处；
4. 柯里化；
5. 代码组合；

# 3. 基础介绍

以下是一个海鸥程序，鸟群合并则可以变成了一个更大的鸟群，繁殖则增加了鸟群的数量，增加的数量就是它们繁殖出来的海鸥的数量。

> 注意这个程序并不是面向对象的良好实践，它只是强调当前这种变量赋值方式的一些弊端。

```javascript
var Flock = function (n) {
  this.seagulls = n
}

Flock.prototype.conjoin = function (other) {
  this.seagulls += other.seagulls
  return this
}

Flock.prototype.breed = function (other) {
  this.seagulls = this.seagulls * other.seagulls
  return this
}

var flock_a = new Flock(4)
var flock_b = new Flock(2)
var flock_c = new Flock(0)

var result = flock_a.conjoin(flock_c).breed(flock_b).conjoin(flock_a.breed(flock_b)).seagulls
//=> 32
```

按照实现的预期，我们期望答案是16，但是输出的结果却是32，这样的代码形式会使得代码的内部状态变得非常难以追踪，错误的原因在于 flock_a 在运算过程中永久地改变了。

再换一种方式：

```javascript
var conjoin = function (flock_x, flock_y) {
  return flock_x + flock_y
}
var breed = function (flock_x, flock_y) {
  return flock_x * flock_y
}

var flock_a = 4
var flock_b = 2
var flock_c = 0

var result = conjoin(breed(flock_b, conjoin(flock_a, flock_c)), breed(flock_a, flock_b))
```

虽然得到了正确的答案，而且少写了很多代码。但函数嵌套有点让人费解，不过代码肯定是越直白越好，所以如果我们再深入挖掘，我们会发现，它不过是在进行简单的加（conjoin） 和乘（breed）运算而已。
代码中的两个函数除了函数名有些特殊，其他没有任何难以理解的地方。我们把它们重命名一下，看看它们的真实功能。

```javascript
var add = function (x, y) {
  return x + y
}
var multiply = function (x, y) {
  return x * y
}

var flock_a = 4
var flock_b = 2
var flock_c = 0

var result = add(multiply(flock_b, add(flock_a, flock_c)), multiply(flock_a, flock_b))
//=>16
```

这样，我们会发现，我们所做的无非是简单的加减乘除：

```javascript
// 结合律（assosiative）
add(add(x, y), z) == add(x, add(y, z))

// 交换律（commutative）
add(x, y) == add(y, x)

// 同一律（identity）
add(x, 0) == x

// 分配律（distributive）
multiply(x, add(y, z)) == add(multiply(x, y), multiply(x, z))
```

基于此，我们可以针对原有代码进行处理：

```javascript
// 原有代码
add(multiply(flock_b, add(flock_a, flock_c)), multiply(flock_a, flock_b))

// 应用同一律，去掉多余的加法操作（add(flock_a, flock_c) == flock_a）
add(multiply(flock_b, flock_a), multiply(flock_a, flock_b))

// 再应用分配律
multiply(flock_b, add(flock_a, flock_a))
```

这样，我们就可以通过简单的函数逻辑调整，优化了绝大多数的代码量，只需要定义好`add`和`multiply`即可。

# 4. 一等公民的函数

## 4.1. 概览

函数是“一等公民”实际上说的是它们和其他对象都一样...所以就是普通公民（坐经济舱的人？）。换句话说，函数没什么特殊的，你可以像对待任何其他数据类型一样对待它们——把它们存在数组里，当作参数传递，赋值给变量...等等。
这是 JavaScript 语言的基础概念，不过还是值得提一提的，大多数人对这个概念集体无视，或者也可能是无知。我们来看一个杜撰的例子：

```javascript
const hi = (name) => `Hi ${name}`
const greeting = (name) => hi(name)
```

这里 `greeting` 指向的那个把 `hi` 包了一层的包裹函数完全是多余的。为什么？因为 JavaScript 的函数是可调用的，当 `hi` 后面紧跟 () 的时候就会运行并返回一个值；如果没有 ()，hi 就简单地返回存到这个变量里的函数。我们来确认一下：

```javascript
hi // name => `Hi ${name}`
hi('jonas') // "Hi jonas"
```

`greeting` 只不过是转了个身然后以相同的参数调用了 hi 函数而已，因此我们可以这么写：

```javascript
const greeting = hi
greeting('times') // "Hi times"
```

换句话说，hi 已经是个接受一个参数的函数了，而它仅仅是用这个相同的参数调用 hi，这样完全多此一举。
用一个函数把另一个函数包起来，目的仅仅是延迟执行，真的是非常糟糕的编程习惯。
接下来看几个例子：

```javascript
// bad
const getServerStuff = (callback) => ajaxCall((json) => callback(json))

// good
const getServerStuff = ajaxCall
```

等同于

```javascript
ajaxCall((json) => callback(json))

// 等价于
ajaxCall(callback)

// 那么，重构下 getServerStuff
const getServerStuff = (callback) => ajaxCall(callback)

// ...就等于
const getServerStuff = ajaxCall // <-- 看，没有括号哦
```

所以以上才是写函数的正确方式：

```javascript
const BlogController = {
  index(posts) {
    return Views.index(posts)
  },
  show(post) {
    return Views.show(post)
  },
  create(attrs) {
    return Db.create(attrs)
  },
  update(post, attrs) {
    return Db.update(post, attrs)
  },
  destroy(post) {
    return Db.destroy(post)
  }
}
```

这个Controller99% 的代码都是垃圾，可以重写为：

```javascript
const BlogController = {
  index: Views.index,
  show: Views.show,
  create: Db.create,
  update: Db.update,
  destroy: Db.destroy
}
```

或者直接全部删掉，因为它的作用仅仅就是把视图（Views）和数据库（Db）打包在一起而已。

## 4.2. 为何函数式一等公民？

回顾下前面的代码， `getServerStuff`和 `BlogController`，虽说添加一些没有实际用处的间接层实现起来很容易，但这样做除了徒增代码量，提高维护和检索代码的成本外，没有任何用处。
另外，如果一个函数被不必要地包裹起来了，而且发生了改动，那么包裹它的那个函数也要做相应的变更。

```javascript
httpGet('/post/2', (json) => renderPost(json))
```

如果 httpGet 要改成可以抛出一个可能出现的 err 异常，那我们还要回过头去把“胶水”函数也改了。

```javascript
// 把整个应用里的所有 httpGet 调用都改成这样，可以传递 err 参数。
httpGet('/post/2', (json, err) => renderPost(json, err))
```

写成一等公民函数的形式，要做的改动将会少得多：

```javascript
httpGet('/post/2', renderPost) // renderPost 将会在 httpGet 中调用，想要多少参数都行
```

除了删除不必要的函数，正确地为参数命名也必不可少。当然命名不是什么大问题，但还是有可能存在一些不当的命名，尤其随着代码量的增长以及需求的变更，这种可能性也会增加。
项目中常见的一种造成混淆的原因是，针对同一个概念使用不同的命名。还有通用代码的问题。比如，下面这两个函数做的事情一模一样，但后一个就显得更加通用，可重用性也更高：

```javascript
// 只针对当前的博客
const validArticles = articles =>
  articles.filter(article => article !== null && article !== undefined),

// 对未来的项目更友好
const compact = xs => xs.filter(x => x !== null && x !== undefined);
```

在命名的时候，我们特别容易把自己限定在特定的数据上（本例中是 `articles`）。这种现象很常见，也是重复造轮子的一大原因。
有一点我必须得指出，你一定要非常小心 this 值，这一点与面向对象代码类似。如果一个底层函数使用了 this，而且是以一等公民的方式被调用的，那就很容易掉进this的坑里（课上代码已经讲的足够多了）。

```javascript
var fs = require('fs')

// bad
fs.readFile('freaky_friday.txt', Db.save)

// good a little
fs.readFile('freaky_friday.txt', Db.save.bind(Db))
```

把 Db 绑定（bind）到它自己身上以后，你就可以随心所欲地调用它的原型链式了。

> this 有利有弊，如果不熟悉，尽量避免使用它，因为在函数式编程中根本用不到它。然而，在使用其他的类库时，可能会发现各种各样关于this的使用。

# 5. 纯函数的好处

## 5.1. 什么是纯函数？

> 纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。

比如数组的 `slice` 和 `splice`，这两个函数的作用并无二致——但是注意，它们各自的方式却大不同，但不管怎么说作用还是一样的。

- `slice` 符合纯函数的定义：因为对相同的输入它保证能返回相同的输出；
- `splice `却不同：会产生可观察到的副作用，即这个数组永久地改变了；

```javascript
var xs = [1, 2, 3, 4, 5]

// 纯的
xs.slice(0, 3)
//=> [1,2,3]

xs.slice(0, 3)
//=> [1,2,3]

xs.slice(0, 3)
//=> [1,2,3]

// 不纯的
xs.splice(0, 3)
//=> [1,2,3]

xs.splice(0, 3)
//=> [4,5]

xs.splice(0, 3)
//=> []
```

在函数式编程中，我们追求的是那种可靠的，每次都能返回同样结果的函数，而不是像 `splice` 这样每次调用后都把数据弄得一团糟的函数。
来看看另一个例子：

```javascript
// 不纯的
var minimum = 21

var checkAge = function (age) {
  return age >= minimum
}

// 纯的
var checkAge = function (age) {
  var minimum = 21
  return age >= minimum
}
```

在不纯的版本中，`checkAge` 的结果将取决于 `minimum` 这个可变变量的值。换句话说，它取决于系统状态（`system state`）；因为它引入了外部的环境，从而增加了认知负荷（`cognitive load`）。
这个例子可能还不是那么明显，但这种依赖状态是影响系统复杂度的[罪魁祸首](http://www.curtclifton.net/storage/papers/MoseleyMarks06a.pdf)。输入值之外的因素能够左右 `checkAge` 的返回值，不仅让它变得不纯，而且导致每次我们思考整个软件的时候都痛苦不堪。
另一方面，使用纯函数的形式，函数就能做到自给自足。我们也可以让 `minimum` 成为一个不可变（`immutable`）对象，这样就能保留纯粹性，因为状态不会有变化。要实现这个效果，必须得创建一个对象，然后调用 `Object.freeze` 方法：

```javascript
var immutableState = Object.freeze({
  minimum: 21
})
```

## 5.2. 副作用内容

“副作用”的关键部分在于“副”。就像一潭死水中的“水”本身并不是幼虫的培养器，“死”才是生成虫群的原因。同理，副作用中的“副”是滋生 bug 的温床。
副作用是在计算结果的过程中，系统状态的一种变化，或者与外部世界进行的可观察的交互。

副作用可能包含，但不限于：

1. 更改文件系统；
2. 往数据库插入记录；
3. 发送一个 http 请求；
4. 可变数据；
5. 打印/log；
6. 获取用户输入；
7. DOM 查询；
8. 访问系统状态...

概括来讲，只要是跟函数外部环境发生的交互就都是副作用——这一点可能会让你怀疑无副作用编程的可行性。函数式编程的哲学就是假定副作用是造成不正当行为的主要原因。
这并不是说，要禁止使用一切副作用，而是说，要让它们在可控的范围内发生。
副作用让一个函数变得不纯是有道理的：从定义上来说，纯函数必须要能够根据相同的输入返回相同的输出；如果函数需要跟外部事物打交道，那么就无法保证这一点了。

## 5.3. demo

函数是两种数值之间的关系：输入和输出。尽管每个输入都只会有一个输出，但不同的输入却可以有相同的输出。下图展示了一个合法的从 x 到 y 的函数关系；
![](https://cdn.nlark.com/yuque/0/2022/gif/2340337/1670510990675-0c4e5c01-e617-4163-bd04-b681c54de50e.gif#averageHue=%23f7e7b8&clientId=uc4a7688b-39cc-4&from=paste&id=u8eea4e6e&originHeight=165&originWidth=250&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=ue11b871a-0266-4164-bc17-99caebbe71b&title=)
下面这张图表展示的就不是一种函数关系，因为输入值 5 指向了多个输出：
![](https://cdn.nlark.com/yuque/0/2022/gif/2340337/1670511007342-30521096-01ba-4d5a-bb01-488fc238cf77.gif#averageHue=%23f6e3b0&clientId=uc4a7688b-39cc-4&from=paste&id=u9aa6787a&originHeight=160&originWidth=251&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u98b13a88-ff20-4b01-a1a9-b2563c46ea0&title=)
函数可以描述为一个集合，这个集合里的内容是 (输入, 输出) 对：[(1,2), (3,6), (5,10)]。
或者：

```javascript
var toLowerCase = { A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', D: 'd' }

toLowerCase['C']
//=> "c"

var isPrime = { 1: false, 2: true, 3: true, 4: false, 5: true, 6: false }

isPrime[3]
//=> true
```

当然实际情况中，可能需要进行一些计算而不是手动指定各项值；不过上例倒是表明了另外一种思考函数的方式。
从数学的概念上将，纯函数就是数学上的函数，而且是函数式编程的全部。使用这些纯函数编程能够带来大量的好处，让我们来看一下为何要不遗余力地保留函数的纯粹性的原因。

## 5.4. 追求纯函数的原因

### 5.4.1. 可缓存性（Cacheable）

首先，纯函数总能够根据输入来做缓存。实现缓存的一种典型方式是 `memoize` 技术：

```javascript
var squareNumber = memoize(function (x) {
  return x * x
})

squareNumber(4)
//=> 16

squareNumber(4) // 从缓存中读取输入值为 4 的结果
//=> 16

squareNumber(5)
//=> 25

squareNumber(5) // 从缓存中读取输入值为 5 的结果
//=> 25
```

```javascript
var memoize = function (f) {
  var cache = {}

  return function () {
    var arg_str = JSON.stringify(arguments)
    cache[arg_str] = cache[arg_str] || f.apply(f, arguments)
    return cache[arg_str]
  }
}
```

值得注意的一点是，可以通过延迟执行的方式把不纯的函数转换为纯函数：

```javascript
var pureHttpCall = memoize(function (url, params) {
  return function () {
    return $.getJSON(url, params)
  }
})
```

这里有趣的地方在于我们并没有真正发送 http 请求——只是返回了一个函数，当调用它的时候才会发请求。这个函数之所以有资格成为纯函数，是因为它总是会根据相同的输入返回相同的输出：给定了 url 和 params 之后，它就只会返回同一个发送 http 请求的函数。
`memoize` 函数工作起来没有任何问题，虽然它缓存的并不是 http 请求所返回的结果，而是生成的函数。

### 5.4.2. 可移植性／自文档化（Portable / Self-Documenting）

纯函数是完全自给自足的，它需要的所有东西都能轻易获得。仔细思考思考这一点...这种自给自足的好处是什么呢？首先，纯函数的依赖很明确，因此更易于观察和理解。

```javascript
// 不纯的
var signUp = function(attrs) {
  var user = saveUser(attrs);
  welcomeUser(user);
};

var saveUser = function(attrs) {
    var user = Db.save(attrs);
    ...
};

var welcomeUser = function(user) {
    Email(user, ...);
    ...
};

// 纯的
var signUp = function(Db, Email, attrs) {
  return function() {
    var user = saveUser(Db, attrs);
    welcomeUser(Email, user);
  };
};

var saveUser = function(Db, attrs) {
    ...
};

var welcomeUser = function(Email, user) {
    ...
};
```

这个例子表明，纯函数对于其依赖必须要明确，这样我们就能知道它的目的。
仅从纯函数版本的 `signUp` 的签名就可以看出，它将要用到 `Db`、`Email` 和 `attrs`，这在最小程度上给了我们足够多的信息。
其次，通过强迫“注入”依赖，或者把它们当作参数传递，我们的应用也更加灵活；因为数据库或者邮件客户端等等都参数化了。如果要使用另一个 `Db`，只需把它传给函数就行了。如果想在一个新应用中使用这个可靠的函数，尽管把新的 `Db` 和 `Email` 传递过去就好了，非常简单。
命令式编程中“典型”的方法和过程都深深地根植于它们所在的环境中，通过状态、依赖和有效作用（`available effects`）达成；纯函数与此相反，它与环境无关，只要我们愿意，可以在任何地方运行它。

### 5.4.3. 可测试性（Testable）

纯函数让测试更加容易。我们不需要伪造一个“真实的”支付网关，或者每一次测试之前都要配置、之后都要断言状态（`assert the stat`e）。只需简单地给函数一个输入，然后断言输出就好了。

### 5.4.4. 合理性（Reasonable）

很多人相信使用纯函数最大的好处是引用透明性（referential transparency）。如果一段代码可以替换成它执行所得的结果，而且是在不改变整个程序行为的前提下替换的，那么我们就说这段代码是引用透明的。
由于纯函数总是能够根据相同的输入返回相同的输出，所以它们就能够保证总是返回同一个结果，这也就保证了引用透明性。我们来看一个例子：

```javascript
var Immutable = require('immutable')

var decrementHP = function (player) {
  return player.set('hp', player.hp - 1)
}

var isSameTeam = function (player1, player2) {
  return player1.team === player2.team
}

var punch = function (player, target) {
  if (isSameTeam(player, target)) {
    return target
  } else {
    return decrementHP(target)
  }
}

var jobe = Immutable.Map({ name: 'Jobe', hp: 20, team: 'red' })
var michael = Immutable.Map({ name: 'Michael', hp: 20, team: 'green' })

punch(jobe, michael)
//=> Immutable.Map({name:"Michael", hp:19, team: "green"})
```

`decrementHP`、`isSameTeam` 和 `punch` 都是纯函数，所以是引用透明的。我们可以使用一种叫做“等式推导”（`equational reasoning`）的方法来分析代码。所谓“等式推导”就是“一对一”替换，有点像在不考虑程序性执行的怪异行为（`quirks of programmatic evaluation`）的情况下，手动执行相关代码。我们借助引用透明性来剖析一下这段代码。
首先内联 `isSameTeam` 函数：

```javascript
var punch = function (player, target) {
  if (player.team === target.team) {
    return target
  } else {
    return decrementHP(target)
  }
}
```

因为是不可变数据，我们可以直接把 `team` 替换为实际值：

```javascript
var punch = function (player, target) {
  if ('red' === 'green') {
    return target
  } else {
    return decrementHP(target)
  }
}
```

if 语句执行结果为 false，所以可以把整个 if 语句都删掉：

```javascript
var punch = function (player, target) {
  return decrementHP(target)
}
```

如果再内联 `decrementHP`，我们会发现这种情况下，punch 变成了一个让 hp 的值减 1 的调用：

```javascript
var punch = function (player, target) {
  return target.set('hp', target.hp - 1)
}
```

等式推导带来的分析代码的能力对重构和理解代码非常重要。事实上，我们重构海鸥程序使用的正是这项技术：利用加和乘的特性。

### 5.4.5. 并行代码

最后一点，也是决定性的一点：我们可以并行运行任意纯函数。因为纯函数根本不需要访问共享的内存，而且根据其定义，纯函数也不会因副作用而进入竞争态（`race condition`）。
并行代码在服务端 js 环境以及使用了 web worker 的浏览器那里是非常容易实现的，因为它们使用了线程（thread）。不过出于对非纯函数复杂度的考虑，当前主流观点还是避免使用这种并行。

# 6. 柯里化

## 6.1. 什么是柯里化？

curry 的概念很简单：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。
你可以一次性地调用 curry 函数，也可以每次只传一个参数分多次调用。

```javascript
var add = function (x) {
  return function (y) {
    return x + y
  }
}

var increment = add(1)
var addTen = add(10)

increment(2)
// 3

addTen(2)
// 12
```

这里我们定义了一个 add 函数，它接受一个参数并返回一个新的函数。调用 add 之后，返回的函数就通过闭包的方式记住了 add 的第一个参数。一次性地调用它实在是有点繁琐，好在我们可以使用一个特殊的 curry 帮助函数（`helper function`）使这类函数的定义和调用更加容易。

```javascript
var curry = require('lodash').curry

var match = curry(function (what, str) {
  return str.match(what)
})

var replace = curry(function (what, replacement, str) {
  return str.replace(what, replacement)
})

var filter = curry(function (f, ary) {
  return ary.filter(f)
})

var map = curry(function (f, ary) {
  return ary.map(f)
})
```

在上面的代码中遵循的是一种简单，同时也非常重要的模式。即策略性地把要操作的数据（`String`， `Array`）放到最后一个参数里。到使用它们的时候你就明白这样做的原因是什么了。

```javascript
match(/\s+/g, 'hello world')
// [ ' ' ]

match(/\s+/g)('hello world')
// [ ' ' ]

var hasSpaces = match(/\s+/g)
// function(x) { return x.match(/\s+/g) }

hasSpaces('hello world')
// [ ' ' ]

hasSpaces('spaceless')
// null

filter(hasSpaces, ['tori_spelling', 'tori amos'])
// ["tori amos"]

var findSpaces = filter(hasSpaces)
// function(xs) { return xs.filter(function(x) { return x.match(/\s+/g) }) }

findSpaces(['tori_spelling', 'tori amos'])
// ["tori amos"]

var noVowels = replace(/[aeiou]/gi)
// function(replacement, x) { return x.replace(/[aeiou]/ig, replacement) }

var censored = noVowels('*')
// function(x) { return x.replace(/[aeiou]/ig, "*") }

censored('Chocolate Rain')
// 'Ch*c*l*t* R**n'
```

这里表明的是一种“预加载”函数的能力，通过传递一到两个参数调用函数，就能得到一个记住了这些参数的新函数。

## 6.2. 使用用途

curry 的用处非常广泛，就像在 `hasSpaces`、`findSpaces` 和 `censored` 看到的那样，只需传给函数一些参数，就能得到一个新函数。
用 map 简单地把参数是单个元素的函数包裹一下，就能把它转换成参数为数组的函数。

```javascript
var getChildren = function (x) {
  return x.childNodes
}

var allTheChildren = map(getChildren)
```

只传给函数一部分参数通常也叫做局部调用（`partial application`），能够大量减少样板文件代码（boilerplate code）。考虑上面的 allTheChildren 函数，如果用 lodash 的普通 map 来写会是什么样的（注意参数的顺序也变了）：

```javascript
var allTheChildren = function (elements) {
  return _.map(elements, getChildren)
}
```

通常我们不定义直接操作数组的函数，因为只需内联调用 `map(getChildren)` 就能达到目的。这一点同样适用于 sort、filter 以及其他的高阶函数（`higher order function`）（高阶函数：参数或返回值为函数的函数）。
当我们谈论纯函数的时候，我们说它们接受一个输入返回一个输出。curry 函数所做的正是这样：每传递一个参数调用函数，就返回一个新函数处理剩余的参数。这就是一个输入对应一个输出啊。
哪怕输出是另一个函数，它也是纯函数。当然 curry 函数也允许一次传递多个参数，但这只是出于减少 () 的方便。

## 6.3. 测试

```javascript
var _ = require('ramda')

// 练习 1
//==============
// 通过局部调用（partial apply）移除所有参数

var words = function (str) {
  return split(' ', str)
}

// 练习 1a
//==============
// 使用 `map` 创建一个新的 `words` 函数，使之能够操作字符串数组

var sentences = undefined

// 练习 2
//==============
// 通过局部调用（partial apply）移除所有参数

var filterQs = function (xs) {
  return filter(function (x) {
    return match(/q/i, x)
  }, xs)
}

// 练习 3
//==============
// 使用帮助函数 `_keepHighest` 重构 `max` 使之成为 curry 函数

// 无须改动:
var _keepHighest = function (x, y) {
  return x >= y ? x : y
}

// 重构这段代码:
var max = function (xs) {
  return reduce(
    function (acc, x) {
      return _keepHighest(acc, x)
    },
    -Infinity,
    xs
  )
}

// 彩蛋 1:
// ============
// 包裹数组的 `slice` 函数使之成为 curry 函数
// //[1,2,3].slice(0, 2)
var slice = undefined

// 彩蛋 2:
// ============
// 借助 `slice` 定义一个 `take` curry 函数，该函数调用后可以取出字符串的前 n 个字符。
var take = undefined
```

代码见课后习题；

# 7. 代码组合

## 7.1. 什么是代码组合？

```javascript
var compose = function (f, g) {
  return function (x) {
    return f(g(x))
  }
}
```

f 和 g 都是函数，x 是在它们之间通过“管道”传输的值。
组合看起来像是在饲养函数。你就是饲养员，选择两个有特点又遭你喜欢的函数，让它们结合，产下一个崭新的函数。组合的用法如下：

```javascript
var toUpperCase = function (x) {
  return x.toUpperCase()
}
var exclaim = function (x) {
  return x + '!'
}
var shout = compose(exclaim, toUpperCase)

shout('send in the clowns')
//=> "SEND IN THE CLOWNS!"
```

代码组合：两个函数组合之后返回了一个新函数，也就是组合某种类型（本例中是函数）的两个元素本就该生成一个该类型的新元素。
在 `compose` 的定义中，g 将先于 f 执行，因此就创建了一个从右到左的数据流。这样做的可读性远远高于嵌套一大堆的函数调用，如果不用组合，shout 函数将会是这样的：

```javascript
var shout = function (x) {
  return exclaim(toUpperCase(x))
}
```

让代码从右向左运行，而不是由内而外运行，我们来看一个顺序很重要的例子：

```javascript
var head = function (x) {
  return x[0]
}
var reverse = reduce(function (acc, x) {
  return [x].concat(acc)
}, [])
var last = compose(head, reverse)

last(['jumpkick', 'roundhouse', 'uppercut'])
//=> 'uppercut'
```

`reverse` 反转列表，`head` 取列表中的第一个元素；所以结果就是得到了一个 last 函数（译者注：即取列表的最后一个元素），虽然它性能不高。这个组合中函数的执行顺序应该是显而易见的。尽管我们可以定义一个从左向右的版本，但是从右向左执行更加能够反映数学上的含义。

```javascript
// 结合律（associativity）
var associative = compose(f, compose(g, h)) == compose(compose(f, g), h)
// true
```

意味着不管你是把 g 和 h 分到一组，还是把 f 和 g 分到一组都不重要。所以，如果我们想把字符串变为大写，可以这么写：

```javascript
compose(toUpperCase, compose(head, reverse))

// 或者
compose(compose(toUpperCase, head), reverse)
```

因为如何为 `compose` 的调用分组不重要，所以结果都是一样的。这也让我们有能力写一个可变的组合（`variadic compose`），用法如下：

```javascript
// 前面的例子中我们必须要写两个组合才行，但既然组合是符合结合律的，我们就可以只写一个，
// 而且想传给它多少个函数就传给它多少个，然后让它自己决定如何分组。

var lastUpper = compose(toUpperCase, head, reverse)

lastUpper(['jumpkick', 'roundhouse', 'uppercut'])
//=> 'UPPERCUT'

var loudLastUpper = compose(exclaim, toUpperCase, head, reverse)

loudLastUpper(['jumpkick', 'roundhouse', 'uppercut'])
//=> 'UPPERCUT!'
```

运用结合律能为我们带来强大的灵活性，而且你也可以在类似 [lodash](https://lodash.com/)、[underscore](http://underscorejs.org/) 以及 [ramda](http://ramdajs.com/) 这样的类库中找到它们的常规定义。
结合律的一大好处是任何一个函数分组都可以被拆开来，然后再以它们自己的组合方式打包在一起。让我们来重构重构前面的例子：

```javascript
var loudLastUpper = compose(exclaim, toUpperCase, head, reverse)

// 或
var last = compose(head, reverse)
var loudLastUpper = compose(exclaim, toUpperCase, last)

// 或
var last = compose(head, reverse)
var angry = compose(exclaim, toUpperCase)
var loudLastUpper = compose(angry, last)
```

## 7.2. pointfree

pointfree 模式指的是，永远不必说出你的数据。它的意思是说，函数无须提及将要操作的数据是什么样的。一等公民的函数、柯里化（curry）以及组合协作起来非常有助于实现这种模式。

```javascript
// 非 pointfree，因为提到了数据：word
var snakeCase = function (word) {
  return word.toLowerCase().replace(/\s+/gi, '_')
}

// pointfree
var snakeCase = compose(replace(/\s+/gi, '_'), toLowerCase)
```

这里所做的事情就是通过管道把数据在接受单个参数的函数间传递。利用 curry，我们能够做到让每个函数都先接收数据，然后操作数据，最后再把数据传递到下一个函数那里去。另外注意在 pointfree 版本中，不需要 word 参数就能构造函数；而在非 pointfree 的版本中，必须要有 word 才能进行一切操作。
再来看一个例子：

```javascript
// 非 pointfree，因为提到了数据：name
var initials = function (name) {
  return name.split(' ').map(compose(toUpperCase, head)).join('. ')
}

// pointfree
var initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '))

initials('hunter stockton thompson')
// 'H. S. T'
```

pointfree 模式能够帮助我们减少不必要的命名，让代码保持简洁和通用。对函数式代码来说，pointfree 是非常好的石蕊试验，因为它能告诉我们一个函数是否是接受输入返回输出的小函数。比如，while 循环是不能组合的。不过你也要警惕，pointfree 就像是一把双刃剑，有时候也能混淆视听。并非所有的函数式代码都是 pointfree 的，不过这没关系。可以使用它的时候就使用，不能使用的时候就用普通函数。

## 7.3. debug

组合的一个常见错误是，在没有局部调用之前，就组合类似 map 这样接受两个参数的函数。

```javascript
// 错误做法：我们传给了 `angry` 一个数组，根本不知道最后传给 `map` 的是什么东西。
var latin = compose(map, angry, reverse)

latin(['frog', 'eyes'])
// error

// 正确做法：每个函数都接受一个实际参数。
var latin = compose(map(angry), reverse)

latin(['frog', 'eyes'])
// ["EYES!", "FROG!"])
```

如果在 debug 组合的时候遇到了困难，那么可以使用下面这个实用的，但是不纯的 trace 函数来追踪代码的执行情况。

```javascript
var trace = curry(function (tag, x) {
  console.log(tag, x)
  return x
})

var dasherize = compose(join('-'), toLower, split(' '), replace(/\s{2,}/gi, ' '))

dasherize('The world is a vampire')
// TypeError: Cannot read property 'apply' of undefined
```

toLower 的参数是一个数组，所以需要先用 map 调用一下它。

```javascript
var dasherize = compose(join('-'), map(toLower), split(' '), replace(/\s{2,}/gi, ' '))

dasherize('The world is a vampire')

// 'the-world-is-a-vampire'
```

## 7.4. 范畴学

> 有兴趣可以了解，作为额外拓展

范畴学（`category theory`）是数学中的一个抽象分支，能够形式化诸如集合论（`set theory`）、类型论（`type theory`）、群论（`group theory`）以及逻辑学（`logic`）等数学分支中的一些概念。范畴学主要处理对象（`object`）、态射（`morphism`）和变化式（`transformation`），而这些概念跟编程的联系非常紧密。下图是一些相同的概念分别在不同理论下的形式：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2340337/1670516347088-e013c468-578a-43ce-8a2d-cee57dc88c66.png#averageHue=%23f5f4f3&clientId=u40d230c9-1599-4&from=paste&id=u00d28bf1&originHeight=399&originWidth=687&originalType=url&ratio=1&rotation=0&showTitle=false&size=168418&status=done&style=none&taskId=u20b5dcf0-0e00-4091-89db-68bf97b70a7&title=)
在范畴学中，有一个概念叫做...范畴。有着以下这些组件（component）的搜集（collection）就构成了一个范畴：

1. 对象的搜集；
2. 态射的搜集；
3. 态射的组合；
4. identity 这个独特的态射；

范畴学抽象到足以模拟任何事物，不过目前我们最关心的还是类型和函数，所以让我们把范畴学运用到它们身上看看。

### 7.4.1. 对象的搜集

对象就是数据类型，例如 String、Boolean、Number 和 Object 等等。通常我们把数据类型视作所有可能的值的一个集合（set）。像 Boolean 就可以看作是 [true, false] 的集合，Number 可以是所有实数的一个集合。把类型当作集合对待是有好处的，因为我们可以利用集合论（`set theory`）处理类型。

### 7.4.2. 态射的搜集

态射是标准的、普通的纯函数。

### 7.4.3. 态射的组合

这张图展示了什么是组合：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2340337/1670516381227-719b2105-acb6-402c-9054-dcfcf63b4f8c.png#averageHue=%23f8f8f8&clientId=u40d230c9-1599-4&from=paste&id=ufe1d90d5&originHeight=228&originWidth=820&originalType=url&ratio=1&rotation=0&showTitle=false&size=45630&status=done&style=none&taskId=u41e90843-a553-465e-b316-6118ca7bd86&title=)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2340337/1670516381238-667c4bc6-199e-4e3a-8898-551c80409136.png#averageHue=%23f9f9f9&clientId=u40d230c9-1599-4&from=paste&id=u5e3d78dd&originHeight=227&originWidth=802&originalType=url&ratio=1&rotation=0&showTitle=false&size=36427&status=done&style=none&taskId=uea509054-fb01-4e70-b09f-8a2221a42a1&title=)
这里有一个具体的例子：

```javascript
var g = function (x) {
  return x.length
}
var f = function (x) {
  return x === 4
}
var isFourLetterWord = compose(f, g)
```

### 7.4.4. identity 这个独特的态射

让我们介绍一个名为 id 的实用函数。这个函数接受随便什么输入然后原封不动地返回它：

```javascript
var id = function (x) {
  return x
}
```

id 函数跟组合一起使用简直完美。下面这个特性对所有的一元函数（`unary function`）（一元函数：只接受一个参数的函数） f 都成立：

```javascript
// identity
;(compose(id, f) == compose(f, id)) == f
// true
```

## 7.5. 测试

```javascript
require('../../support')
var _ = require('ramda')
var accounting = require('accounting')

// 示例数据
var CARS = [
  { name: 'Ferrari FF', horsepower: 660, dollar_value: 700000, in_stock: true },
  { name: 'Spyker C12 Zagato', horsepower: 650, dollar_value: 648000, in_stock: false },
  { name: 'Jaguar XKR-S', horsepower: 550, dollar_value: 132000, in_stock: false },
  { name: 'Audi R8', horsepower: 525, dollar_value: 114200, in_stock: false },
  { name: 'Aston Martin One-77', horsepower: 750, dollar_value: 1850000, in_stock: true },
  { name: 'Pagani Huayra', horsepower: 700, dollar_value: 1300000, in_stock: false }
]

// 练习 1:
// ============
// 使用 _.compose() 重写下面这个函数。提示：_.prop() 是 curry 函数
var isLastInStock = function (cars) {
  var last_car = _.last(cars)
  return _.prop('in_stock', last_car)
}

// 练习 2:
// ============
// 使用 _.compose()、_.prop() 和 _.head() 获取第一个 car 的 name
var nameOfFirstCar = undefined

// 练习 3:
// ============
// 使用帮助函数 _average 重构 averageDollarValue 使之成为一个组合
var _average = function (xs) {
  return reduce(add, 0, xs) / xs.length
} // <- 无须改动

var averageDollarValue = function (cars) {
  var dollar_values = map(function (c) {
    return c.dollar_value
  }, cars)
  return _average(dollar_values)
}

// 练习 4:
// ============
// 使用 compose 写一个 sanitizeNames() 函数，返回一个下划线连接的小写字符串：例如：sanitizeNames(["Hello World"]) //=> ["hello_world"]。

var _underscore = replace(/\W+/g, '_') //<-- 无须改动，并在 sanitizeNames 中使用它

var sanitizeNames = undefined

// 彩蛋 1:
// ============
// 使用 compose 重构 availablePrices

var availablePrices = function (cars) {
  var available_cars = _.filter(_.prop('in_stock'), cars)
  return available_cars
    .map(function (x) {
      return accounting.formatMoney(x.dollar_value)
    })
    .join(', ')
}

// 彩蛋 2:
// ============
// 重构使之成为 pointfree 函数。提示：可以使用 _.flip()

var fastestCar = function (cars) {
  var sorted = _.sortBy(function (car) {
    return car.horsepower
  }, cars)
  var fastest = _.last(sorted)
  return fastest.name + ' is the fastest'
}
```

代码见课后习题；
