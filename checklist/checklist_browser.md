浏览器
==================================

## API 相关

1. 浏览器提供的符合W3C标准的DOM操作API、浏览器差异、兼容性
> 掌握即可

2. 浏览器提供的浏览器对象模型 (BOM)提供的所有全局API、浏览器差异、兼容性
> 掌握即可

3. 大量DOM操作、海量数据的性能优化(合并操作、Diff、requestAnimationFrame 等)
> 使用 DocumentFragement (document.createDocumentFragement())
>> DocumentFragments 是一个 DOM Node Object，不会参与到 main dom tree。通常将要添加的 dom element，先添加到 documentFragement，然后再将 documentFragement 追加到 DOM tree 里。由于 documentFragement 是在内存中操作，因此在它上面操作 children，不会导致 reflow。 reflow 只会在 append documentFragement 才会发生。

> requestAnimationFrame(callback)，其中 callback 接收一个参数，该参数表示 callback 开始执行的时刻。

4. 浏览器海量数据存储、操作性能优化
> IndexDB ?

5. DOM事件流的具体实现机制、不同浏览器的差异、事件代理
> 事件冒泡 和 捕获
> 浏览器差异：addEventListener 和 attachEvent
> 事件代理：由于事件会在冒泡阶段向上传播到父元素，因此可以把子元素的监听函数定义在父元素上。由父元素的监听函数统一处理多个子元素的事件。这种方法就叫做事件代理。利用这个特性，可以对事件绑定做一些优化，在 JS 中，如果注册的事件越来越多，页面的性能就会越来越差，这是因为：
>> 1. 函数是对象，会占用内存，内存占用越多，浏览器就会变慢
>> 2. 注册事件一般都会指定 dom 元素，事件越多，导致 DOM 元素访问次数越多，会延迟页面交互就绪的时间

> 使用事件代理的优点就是：
>> 1. 可以减少内存消耗，提高性能
>> 2. 可以动态绑定事件 (对子元素进行修改、删除，无需考虑事件绑定)

6. 前端发起网络请求的几种方式及其底层实现、可以手写原生 ajax、fetch、可以熟练使用第三方库
> 几种方式：
>> 1. form 表单
>> 2. iframe
>> 3. 刷新页面 (location.reload())
>> 4. ajax
>> 5. fetch
>> 6. axios / request 等众多开源库

> 手写原生 ajax 和 fetch：就是直接使用 XMLHttpRequest 和 fetch 发起请求和处理响应
> 第三方库：axios
> fetch 的缺点：
>> fetch 只对网络请求报错，对 400，500都当成成功的请求，需要特别封装处理
>> fetch 默认不会带 cookie，需要添加配置项；axios 会自动带 cookie，可以支持 csrf
>> fetch 不支持 abort，不支持超时控制，使用 setTimeout 和 Promise.reject 进行超时控制，并不能真正阻止请求继续在后台运行。
>> fetch 不能原生监测请求的进度，而 XHR 可以

关于这个问题可以参考[这篇文章](https://segmentfault.com/a/1190000012836882), 推荐使用 axois

7. 浏览器的同源策略，如何避免同源策略，几种方式的异同点以及如何选型
> 同源策略：是一个重要的安全策略。用于限制一个 origin 的 document 或者 script，如果与另一个源的资源进行交互，它能帮助阻隔恶意 document，减少可能被攻击的媒介。
> 同源的定义：两个 URL 的 protocol、 port、 host 都相同的话，这2个 url 是同源
> 跨域的方式：
>> 一 CORS (Cross-Origin Resource Sharing，跨域资源共享)，它由一系列传输的 HTTP 头组成，这些 HTTP 头决定浏览器是否阻止前端 JS 代码获取跨域请求的响应。同源安全策略默认阻止了跨域获取资源。但是 CORS 给了web服务器这样的权限，即服务器可以选择，允许跨域请求访问它们的资源。
>>> 分为 简单请求 和 复杂请求
>>>> 简单请求不会触发 CORS 预检请求 (preflight)。GET / HEAD / POST 属于简单请求。还有其他几种情况也是会属于 简单请求

>> 二 Node 正向代理
>> 三 Ngnix 反向代理
>> 四 JSONP 主要是利用 `<script>` 标签没有跨域限制这个特性来完成。缺点是只支持 GET 请求
>> 五 WebSocket
>> 六 window.postMessage
>> 七 document.domain + Iframe
>> 八 window.location.hash + Iframe
>> 九 window.name + Iframe
>> 十 浏览器开启跨域(终极方案)

具体可以参考[这篇文章](https://juejin.im/post/5e948bbbf265da47f2561705#heading-43)

8. 浏览器提供的几种存储机制、优缺点、开发中正确的选择
> 存储机制：cookies， sessionStorage，localStorage， indexedDB
> cookies 主要用于存储身份识别信息。缺点是可以存储的大小有限(一般是 4KB)。另外每次请求都会携带 cookies，增加了不必要的网络传输，比如一些图片，css请求就不需要cookie。针对这种情形，可以将资源部署到 cdn 上面，因为 cdn 的域名跟站点域名不一样，这样就不会携带 cookie。
> localStorage 适合用于存储一些内容较稳定的资源，比如 base64 的图片
> sessionStorage 适合用于存储生命周期和它同步的会话级别信息。
> cookies, localStorage, sessionStorage 都是存储在浏览器端，都遵循浏览器的同源策略，不同的是它们的生命周期和作用域不同。
>> localStorage 只要在相同的协议、相同的主机、相同的端口下，就能读取/修改同一份数据(隐式模式的窗口除外)。sessionStorage 除了前面3点要求外，还需要在同一窗口下。
>> indexedDB 可以存储的空间更大，除了字符串外，还可以存储对象，二进制文件等。indexedDB 是异步操作，其他三个都是同步操作。而且支持数据库 ACID 特性。一样遵循同源策略。
>> indexedDB 采用索引的方式查找数据，因此性能特别好。

可以参考[这篇文章](https://www.cnblogs.com/yanggb/p/10675855.html)

9. 浏览器跨标签通信

这个要分为同源和非同源两种情形来考虑。同源有以下几种方式：
> 1. BroadCast Channel (兼容性不好，IE 和 safari 都不支持)
> 2. serviceWorker: 将 serviceWorker 作为消息的处理中心, 接收到某个 client 的消息后，对所有 clients 发送 message
> 3. localStorage: 通过监听 storage，一旦某个页面对 localStorage 做了修改，那么监听 storage 的页面都能收到消息 (同一个页面里 storage 事件是不会被触发。如果需要，需要显示调用 window.dispatchEvent(new Event(UPDATE_CART_SUCCESS)); 然后单独监听 UPDATE_CART_SUCCESS 这个事件)
> 4. Shared Worker + 轮询
> 5. IndexedDB + 轮询
> 6. Cookies + 轮询
> 6. window.open + window.opener (口口相传), 通过 postMessage 进行消息传递，但是一旦某个页面不是通过这种方式打开，那么就无法接收到消息
> 7. websocket，这种方式要借助服务端，客户端发送消息给服务端，服务端再发给其他clients

前面三种方式都是 广播 模式，4、5 和 6 是 共享存储 + 轮询模式；

非同源的方式：

> 1. 采用 iframe 的方式

tab A -----> iframe A[bridge.html]
                     |
                     |
                    \|/
             iframe B[bridge.html] ----->  tab B

tabA 中嵌入 iframe A, tabB 中嵌入 iframe B, iframe A 和 iframe B 引用相同的 bridge.html. 这样 iframe A 和 iframe B 就是同源，可以采用上面介绍的几种方式进行通信。tab A 和 iframe A 可以通过 postMessage 进行通信，同理 iframe B 和 tabB 也使用 postMessage。借助这种方式，就可以实现 tabA 和 tabB 通信。

可以参考[这篇文章](https://juejin.im/post/5ca04406f265da30ac219ccc)

## 原理

1. 各浏览器使用的JavaScript引擎以及它们的异同点、如何在代码中进行区分
> JS 引擎
+ IE/Edge：JScript
+ chrome: V8
+ safari: Nitro
+ Firefox: SpiderMonkey（1.0-3.0）/ TraceMonkey（3.5-3.6）/ JaegerMonkey（4.0-)
+ Opear: Linear A（4.0-6.1）/ Linear B（7.0-9.2）/ Futhark（9.5-10.2）/ Carakan（10.5-）

> 内核 (渲染引擎)
+ IE/Edge: trident -> EdgeHTML
+ Chrome: webkit -> blink
+ Safari: webkit
+ Firefox: Gecko
+ Opera: Presto -> blink

> 区分：通过 navigator.userAgent 获取

浏览器信息按照以下信息罗列：

+ 浏览器系统：所运行的操作系统，包含Windows、MacOS、Linux、Android、iOS
+ 浏览器平台：所运行的设备平台，包含Desktop桌面端、Mobile移动端
+ 浏览器内核：浏览器渲染引擎，包含Webkit、Gecko、Presto、Trident
+ 浏览器载体：五大浏览器品牌，包含Chrome、Safari、Firefox、Opera、IExplore/Edge
+ 浏览器外壳：基于五大浏览器品牌的内核进行开发，再套一层自研技术的外壳，如国内众多浏览器品牌

具体可以参考[这篇文章](https://juejin.im/post/5d0220a8f265da1bcc193c6c)

2. 请求数据到请求结束与服务器进行了几次交互 (这个问题应该规到 网络协议 才对)
> 这种一般不会考查到，不做具体研究

具体可以参考[这篇文章](https://juejin.im/entry/58ce00c5ac502e00589b4bde)

3. 可详细描述浏览器从输入URL到页面展现的详细过程
> 整体来说可以分为下面几个过程：
>> 0. 浏览器是多进程，每个进程又是多线程，请求资源会新开一个线程
>> 1. DNS 解析
>> 2. TCP 连接
>> 3. 发送 HTTP 请求
>> 4. 服务器处理请求并返回 HTTP 报文
>> 5. 浏览器解析渲染页面
>> 6. 连接结束

具体可以参考[这篇文章](https://segmentfault.com/a/1190000006879700) 和 [这篇文章](https://zhuanlan.zhihu.com/p/34453198)

4. 浏览器解析HTML代码的原理，以及构建DOM树的流程
> 字节 -> 字符 -> token -> nodes -> object model

5.浏览器如何解析CSS规则，并将其应用到DOM树上
> 同 4 类似

6.浏览器如何将解析好的带有样式的DOM树进行绘制
> 合成 Render Tree

7.浏览器的运行机制，如何配置资源异步同步加载
> async / defer

8.浏览器回流与重绘的底层原理，引发原因，如何有效避免
> reflow 和 repaint

9.浏览器的垃圾回收机制，如何避免内存泄漏
> 

10.浏览器采用的缓存方案，如何选择和控制合适的缓存方案
> cache-control / etag
> html 使用 no-cache，其他资源使用 public, 并且将 max-age 设置大一些