### 前言
最近在做h5项目时，简单的一个toast提示框，但是出现了一个bug，就是在Safari浏览器中复制内容时，页面会闪烁一下，不知道是什么原因，最后排查结果是意想不到的。

### 问题

在 IOS Safari浏览器中复制内容时，页面会闪烁一下，底部地址栏会消失，然后出现，导致页面闪烁。
问题刚出现的时候第一时间想到的就是toast的位置，但是发现toast的位置是固定的，而且在页面闪烁的时候，toast也是决对定位，不可能会导致页面闪烁。

### 排查

在网上查了一些资料，发现IOS Safari浏览器在复制内容的时候，会触发一个事件，这个事件会导致页面闪烁，这个事件的名字叫做copy，这个事件在IOS Safari浏览器中是没有的，所以就排除了这个事件。
同样的情况下，Dialog弹窗却不会出现任何闪烁，这就不明所以了，我尝试着用Dialog来模拟了一个toast，结果还是会出现问题，如下所示：


那不是因为toast导致的抖动，到底是什么原因呢，经过层层排查，想到了浏览器回流、重绘，Safari浏览器bug、vant组件库的bug，最后排查可能是浏览器重绘制机制导致的。

回流：当render树中的一部分或者全部因为大小边距等问题发生改变而需要重建的过程叫做回流（改变大小）。

重绘：当元素的一部分属性发生变化，如外观背景色不会引起布局变化而需要重新渲染的过程叫做重绘（改变样式）。

注意：回流必将引起重绘，而重绘不一定会引起回流。

根据概念结合实际情况，toast出现、隐藏都只会引起重绘，而不会引起回流，所以问题可能不在于toast，出发点就是错误的，Toast: 我好无辜！！！

再次想了想，只有复制内容时，页面会闪烁，而其他情况出现toast并不会引起页面闪烁，所以问题可能在于复制内容时，这个复制操作！

查看了复制操作，果然问题出现在这里，复制操作是这样实现的：

const input = document.createElement('textarea')
input.value = text
document.body.appendChild(input)
input.select()
document.execCommand('copy')
input.parentElement.removeChild(input)

看到这里，结果已经呼之欲出了，实现复制操作时，动态添加了DOM元素，罪魁祸手就是这个添加完就删除的临时产物，这个操作造成了回流，导致Sfarila浏览器页面闪烁。

找到了问题所在，解决起来也就简单了很多，只需要换个复制方式就可以了。

刚好其中execCommand也被弃用了，最后使用navigator.clipboard方式来实现复制功能没有一点儿问题。

### 修改方案

使用navigator.clipboard方式来实现复制功能

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      // todo
    }, (err) => {
      // todo
    });
  } else {
    const input = document.createElement('textarea')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.parentElement.removeChild(input)
  }
}

navigator.clipboard 是一个只读属性，它返回一个 Clipboard 对象，可以用来读写剪贴板的内容。它是 Clipboard API 的一部分，可以用来实现剪切、复制、粘贴的功能。

要使用 navigator.clipboard 的方法，需要先获取用户的许可，可以通过 Permissions API来请求 “clipboard-read” 或 “clipboard-write” 的权限。

navigator.clipboard 有以下几个方法：

read()：从剪贴板读取数据，返回一个 Promise 对象，解析为一个 DataTransfer 对象，包含多种类型的数据。
readText()：从剪贴板读取文本，返回一个 Promise 对象，解析为一个字符串。
write(data)：写入任意数据到剪贴板，接受一个 DataTransfer 对象作为参数，返回一个 Promise 对象。
writeText(text)：写入文本到剪贴板，接受一个字符串作为参数，返回一个 Promise 对象。

#### navigator.clipboard 和 document.execCommand区别

navigator.clipboard 和 document.execCommand 都是可以用来操作剪贴板的 API，但是它们有以下几点不同：

navigator.clipboard 是异步的，返回 Promise 对象，而 document.execCommand 是同步的，返回布尔值。
navigator.clipboard 可以处理多种类型的数据，而 document.execCommand 只能处理文本。
navigator.clipboard 需要用户的许可，而 document.execCommand 不需要。
navigator.clipboard 可以在任何时候调用，而 document.execCommand 只能在用户交互的上下文中调用。
navigator.clipboard 的优点是它更安全、更灵活、更现代，而且不会阻塞主线程。它的缺点是它需要用户的许可，而且浏览器的兼容性不是很好。

document.execCommand 的优点是它不需要用户的许可，而且浏览器的兼容性比较好。它的缺点是它只能处理文本，而且可能在未来被废弃。不过目前大部分还是用document.execCommand来实现复制粘贴操作。

两种方法浏览器兼容性：


navigator.clipboard


execCommand



一波三折，出现问题要学会不同方向思考，基础也要扎实，如果连回流和重绘的概念都不记得，可能这个问题排查起来难度倍增！
又是挣窝囊废的开心一天真好～