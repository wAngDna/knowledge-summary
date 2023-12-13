### 前言

在开发H5应用时，需求中会有一些落地页，而且占比比较大，落地页承担的职责就是引流，引流有两种形式，同时也是我们对唤起端的定义：引导已下载APP用户打开APP，引导未下载APP用户下载APP。问题的关键是如何唤起APP。

### 解决方案

引导已下载APP用户打开APP，能够有效提高用户粘性，而且从体验上说，APP的体验更好，引导用户下载APP则是能提高我们的用户量。

#### 唤起端的媒介：

1. URL Scheme

我们手机上有许多私密信息，如联系方式，照片等等，我们肯定不希望这些信息可以被手机应用随意读取，信息泄露危害甚大，所以，如何保证个人信息在设备所有者知情并允许的情况下使用，是设备安全的核心问题。

对此此种现状，Apple公司使用了沙盒机制：应用只能访问它声明可能访问的资源，这样做虽然安全了，但是也变相限制了应用的能力。

所以我们需要一个辅助工具来帮助我们实现应用间的通信，这个工具就是URL Scheme。

URL Scheme是一种特殊的协议，它允许应用与其他应用进行通信。

组成：
[scheme:][//authority][path][?query][#fragment]

我们拿常见的一个网址来举例：

https://www.baidu.com，其中scheme就是https。
就像服务器资源分配了一个URL，以便我们去访问它，同样也可以给手机APP分配一个特殊格式的URL，来访问这个APP或者APP中某个功能来实现通信，APP得有一个标识，好让我们可以定位到它，它就是URL的Scheme。

常见APP的URL Scheme有：

weixin:// 微信
qq://  QQ
alipay:// 支付宝
sinaweibo:// 新浪微博
youdao:// 有道词典
...


URL Scheme的格式为：

scheme://[path]?[query]

其中：
scheme：应用标识
path：行为(应用的某个功能)
query：功能需要的参数


2. Intent 
Intent是Android系统中用于启动应用的一种机制，它是一种特殊的URI，它可以指定要启动的应用的包名，以及要启动的应用的行为。
但是安卓的原生谷歌浏览器自从chrome25版本开始对于唤端功能做了一些变化，URL Scheme无法再启功Android应用，所以，我们需要使用Intent来实现唤起。

Intent的格式为：

intent:#Intent;action=ACTION;category=CATEGORY;component=PACKAGE_NAME/ACTIVITY_NAME;scheme=SCHEME;end

其中：
intent：必须，表示这是一个Intent
action：可选，表示要执行的行为
category：可选，表示要执行的行为的分类
component：可选，表示要执行的行为的组件
scheme：可选，表示要执行的行为的scheme
end：必须，表示结束

如果用户未安装APP，则会跳转到系统默认商店，当然，如果你想要指定一个唤起失败的跳转地址，添加下面字符串在end前就可以了

S.browser_fallback_url=[encoded_full_url]

3. Universal Link

Universal Link 是苹果在 WWDC2015 上为 iOS9 引入的新功能，通过传统的 HTTP 链接即可打开 APP。如果用户未安装 APP，则会跳转到该链接所对应的页面。

有大量的文章会详细的告诉我们如何配置，你也可以去看官方文档 https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html#//apple_ref/doc/uid/TP40016308-CH12-SW2

#### 三种调用唤端媒介方式

通过前面的介绍，我们可以发现，无论是 URL Scheme 还是 Intent 或者 Universal Link ，他们都算是 URL ，只是 URL Scheme 和 Intent 算是特殊的 URL。所以我们可以拿使用 URL 的方法来使用它们。

1. iframe

我们可以把落地页的URL放在iframe中，这样就实现了落地页的唤起。

<iframe src="落地页的URL"></iframe>


2. a标签

我们可以把落地页的URL放在a标签中，这样就实现了落地页的唤起。

<a href="特殊URL"></a>

使用过程中，对于动态生成的 a 标签，使用 dispatch 来模拟触发点击事件，发现很多种 event 传递过去都无效；使用 click 来模拟触发，部分场景下存在这样的情况，第一次点击过后，回到原先页面，再次点击，点击位置和页面所识别位置有不小的偏移，所以 Intent 协议从 a 标签换成了 window.location。

3. window.location

window.location.href = '特殊URL'

#### 判断唤端是否成功

如果唤端失败（APP 未安装），我们总是要做一些处理的，可以是跳转下载页，可以是 ios 下跳转 App Store… 但是Js 并不能提供给我们获取 APP 唤起状态的能力，Android Intent 以及 Universal Link 倒是不用担心，它们俩的自身机制允许它们唤端失败后直接导航至相应的页面，但是 URL Scheme 并不具备这样的能力，所以我们只能通过一些很 low 的方式来实现 APP 唤起检测功能。

const initialTime = new Date()
let counter = 0
let waitTime = 0

// 2.5s 判断跳转，如果没有跳转打开下载页
const checkOpen = setInterval(() => {
  counter++
  waitTime = new Date() - initialTime
  if (waitTime > 2500) {
    clearInterval(checkOpen)
  }
  if (counter < 100) return
  // 判断页面是否隐藏
  const hide = document.hidden || document.webkitHidden
  if (!hide) {
    window.location.replace(fallback)
  }
}, 20)

通过上面几点我们看出，在H5唤端方面，没有一个十全十美的解决方案，我们只能说是做到最大程度的兼容。

这里推荐一个开箱即用的库 callapp-lib 


callapp-lib 是一个基于 JavaScript 的库，它提供了一系列的 API 来帮助你在你的应用中实现唤起 APP 的功能。

它支持 URL Scheme、Intent、Universal Link 以及自定义唤起方式。

具体使用方式请看文档: https://www.npmjs.com/package/callapp-lib

它能在大部分的环境中成功唤端，而且炒鸡简单啊，拿过去就可以用啊，还支持很多扩展功能啊