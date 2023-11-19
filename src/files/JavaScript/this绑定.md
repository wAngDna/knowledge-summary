<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-19 18:39:55
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-19 18:39:55
 * @FilePath: /knowledge-summaryp-review/src/files/JavaScript/this绑定.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
## JavaScript 中 this 绑定

### 1. 绑定分类

- 显式绑定 - 通过调用 call,apply,bind 等函数，主动改变 this 指向，其中 bind 属于硬绑定，一旦绑定后将无法再修改 this 指向
- 隐式绑定 - 函数调用时，如果前面存在调用它的对象，则 this 指向这个对象，如果包含多个前缀，则指向离他最近的对象
- 默认绑定 - 函数调用时，无任何前缀，默认指向 window，严格模式下 this 是 undefined
- new 绑定 - 调用 new 时，会将 this 指向创建出来的新对象上
- 箭头函数绑定 - 箭头函数绑定，箭头函数没有自己的 this，取决于父层最近作用域的 this，箭头函数属于硬绑定，一旦绑定后无法修改

### 2. this 绑定的优先级

- 显式绑定 > 隐式绑定 > 默认绑定
- new 绑定 > 隐式绑定 > 默认绑定
- 为什么显示绑定无法和 new 绑定比较呢，因为没有他俩比较的场景，会报错
