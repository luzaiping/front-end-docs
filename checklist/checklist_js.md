前端工程师的自检清单 - JS篇
=========================
内容参考自[掘金-一个前端工程的自检清单](https://juejin.im/post/5cc1da82f265da036023b628)。该文章列出了清单内容，这边会对清单项进行解答。

## javascript基础

### 变量和类型

1. Javascript规定了几种语言类型
  > 答：7种，包括 Boolean, Number, String, Null, Undefined, Object, Symbol
  > 但是基本类型是 6 种：boolean, string, null, undefined, symbol, number

2. JavaScript对象的底层数据结构是什么
  > 答：地址指针存储在 stack 中，指针所指向的值(也就是对象值) 是存储于 Heap 中 (`*这个回答不确定是否就是所要的答案`)

3. Symbol 类型在实际开发中的应用、可手动实现一个简单的 Symbol
  > 答：`空着`，这个问题偏冷门，后面过来补充

4. JavaScript中的变量在内存中的具体存储形式
  > 答：基本类型直接存储在 stack 中；引用类型的指针存储在 stack，对应的值存储在 Heap 中。

5. 基本类型对应的内置对象，以及他们之间的装箱拆箱操作
  > 答：string -> String (其他类型就不说了；Symbol 是基本类型，没有对应的内置对象)
      装箱：将基本类型转换为引用类型；分为 隐式装箱 和 显式装箱 (`*`)
      拆箱：将引用类型转换为基本类型，一般是通过引用类型的 valueOf() 和 toString() 来实现(`* valueOf 和 toString() 用法还是有差异，要根据具体类型来区分`)

6. 理解值类型和引用类型
  > 答：这个应该是考核基本类型和引用类型的差异。直观的解答就是通过 const 定义变量来区分。

7. null和undefined的区别
  > 答：undefined 表示未定义的值，语义是希望表示一个变量最原始的状态，而非人为操作的结果，这种原始状态会 在以下四种场景出现：
  >> 1. 声明了一个变量，但没有赋值; 比如 let foo;
  >> 2. 访问对象上不存在的属性, 比如 object.notExistProperty;
  >> 3. 函数定义了形参，但是没有传实参；
  >> 4. 使用 void 对表达式求值；比如 void 0;
  
  > null 字面意思是 `空值`, 表示一个对象被人为重置为空对象，而非一个变量最原始的状态。在内存里的表示是，栈中的变量，其指向的对象不存在于堆中。当一个对象被赋值为 null 后, 这个对象在内存中就处于游离状态，GC会择机回收该对象并释放内存。因此如果要回收某个对象，就可以将值赋值为 null, 但是不能赋值为 undefined。另外 typeof null === 'object'. 这边 typeof 会判断为 object 类型，是因为 js 数据类型在底层中都是以二进制的形式表示，如果二进制的前3位是0，就会被typeof判定为对象类型，而null的二进制位恰好都是0，因此，null被误判为 object。

  > 相似性：
  >> 1. 在这2个值对应的变量上调用方法都会抛出异常
  >> 2. undefined == null 会返回 true, 但是 === 会返回 false
  >> 3. 将这2个值转为 boolean, 都会返回 false

8. 至少可以说出三种判断JavaScript数据类型的方式，以及他们的优缺点，如何准确的判断数组类型
  > 判断数据类型的方式：
  >> 1. 使用 typeof，缺点 typeof null 会返回 object
  >> 1. 使用 instanceof, 这个是用于判断一个构造函数的原型是否在指定对象原型链上，确切来说不是用于判断数据类型
  >> 1. 使用 Object.prototype.toString.call。这个可以判断很多 Object 具体类型，包括 Function, Array, Promise, Generator, Date

  > 准确判断数组类型:
  >> 使用 Object.prototype.toString.call(), 如果是数组，一定会返回 "[object Array]"
  >> 使用 ES6 Array.isArray()

9. 可能发生隐式类型转换的场景以及转换原则，应如何避免或巧妙应用
  > 场景：
  >> 1. if 判断语句 或者 三位运算符，会将值转为 boolean 类型
  >> 2. `+` 前后两个变量，有一个是字符串，另外一个不是字符串，就会将非字符串转为字符串

  > 转换原则：这个内容有点多，也有点偏，暂不打算研究

  > 如何避免或巧妙应用：显式转换为具体类型进行操作 (`这个答案应该不理想`)

10. 出现小数精度丢失的原因，JavaScript可以存储的最大数字、最大安全数字，JavaScript处理大数字的方法、避免精度丢失的方法
  > 这是经典的 0.1 + 0.2 === 0.30000000000000004 问题, [参考这篇文章](https://zhuanlan.zhihu.com/p/66949640)
  > 0.1和0.2在计算机中的二进制存储会让它们本身损失掉一定的精度，而它们在计算机中的二进制存储转换成十进制时已经不是真正的0.1和0.2了，相加的结果也就自然不是0.3了
  > 可以存储的最大数字是 Number.MAX_VALUE(值大概是 1.79E+308 或者是 2**1024 -> 2的1024幂)
  > 最大安全数字是 Number.MAX_SAFE_INTEGER (2**53-1)
  > 处理大数字的方法：使用 BigInt 
  > 避免精度丢失的方法：
  >> 1. NPM上有许多支持JavaScript和Node.js的数学库，比如math.js，decimal.js,D.js等等
  >> 1. 使用 toFixed()，但是这个方法使用上有点陷阱，需要注意
  >> 1. 使用 ES6 引入的 Number.EPSILON，判断 (0.1 + 0.2) - 0.3 < Number.EPSILON 是否为 true，如果是就是相等，这个函数用于表示如果2个数的差值很小(Number.EPSILON),就判定为相等。

### 原型和原型链

11. 理解原型设计模式以及JavaScript中的原型规则
> 答: 原型设计模式：指用原型实例指向创建对象的种类，并且通过拷贝这些原型创建新的对象。(`很拗口的说法`)

12. instanceof的底层实现原理，手动实现一个instanceof
> 答: 底层实现原理就是，右边构造函数的 prototype 属性所指向的原型在左边对象的原型链上，就返回 true；否则返回 false。手动实现 instanceof 可以参考 wheel.js 里的 new_instance_of 函数

13. 实现继承的几种方式以及他们的优缺点
> 答: 一共6种
>> 1. 原型链继承
   >>> 缺点：a、引用类型的属性被所有实例共享；b、创建子类实例时，不能向父类传参
>> 2. 借用构造函数 (经典继承)
  >>> 优点：a、避免父类的属性被所有实例共享；b、可以在 Child 向 Parent 传参
  >>> 缺点：方法都在构造函数中定义，每次创建实例都会创建一遍方法。
>> 3. 组合继承: 原型链继承和经典继承双剑合璧。
  >>> 优点：融合原型链继承和构造函数的优点，是 JavaScript 中最常用的继承模式。
  >>> 缺点：组合继承最大的缺点是会调用两次父构造函数
>> 4. 原型式继承: 就是 ES5 Object.create 的模拟实现，将传入的对象作为创建的对象的原型。
  >>> 缺点：包含引用类型的属性值始终都会共享相应的值，这点跟原型链继承一样。
>> 5. 寄生式继承: 创建一个仅用于封装继承过程的函数，该函数在内部以某种形式来做增强对象，最后返回对象。
  >> 缺点：跟借用构造函数模式一样，每次创建对象都会创建一遍方法。
>> 6. 寄生组合式继承

具体参考[这篇文章](https://mp.weixin.qq.com/s?__biz=MjM5MDA2MTI1MA==&mid=2649094554&idx=1&sn=099d020604fc9737ca602624855391e4&chksm=be5bde37892c57217d8bfd639fa40f349d61cbcaea2f92501d3971aed27d5ccc3511670f72a3&mpshare=1&scene=1&srcid=&sharer_sharetime=1589297315114&sharer_shareid=3a6b1f037bf9e64cbbd8b943d6b0cde6&key=fac323af83145581c9b434a1c8d5c2bc8c6b998ae4b92aed48b0fc137e1c3567e3a939d4015eea755719938c5adddc9db03550d67cdb962e67b786a0e68781124336789e2dd8988269d1bef5b35bd303&ascene=1&uin=OTUxMTg5OTQy&devicetype=Windows+10+x64&version=62090070&lang=zh_CN&exportkey=ATm8KugwQL6PBT7grSSea5k%3D&pass_ticket=%2FVM317z9E2z%2FzQBsKOprSSSEKSN7n9I%2F3rWSlYv%2FG8kWkOIjLSbfpHAu%2BmqUA7Sb)

14. 至少说出一种开源项目(如Node)中应用原型继承的案例
> 答：

15. 可以描述new一个对象的详细过程，手动实现一个new操作符
> 答：过程
>> 1. 创建 ECMAScript 原生对象 obj;
>> 2. 给 obj 设置原生对象的内部属性；（和原型属性不同，内部属性表示为 [[PropertyName]]，两个方括号包裹属性名，并且属性名大写，比如常见 [[Prototype]]、[[Constructor]]）;
>> 3. 设置 obj 的内部属性 [[Class]] 为 Object;
>> 4. 设置 obj 的内部属性 [[Extensible]] 为 true；
>> 5. 将 proto 的值设置为 F 的 prototype 属性值；(obj.__proto__ = F.prototype)
>> 6. 如果 proto 是对象类型，则设置 obj 的内部属性 [[Prototype]] 值为 proto；（进行原型链关联，实现继承的关键）
>> 7. 如果 proto 是不对象类型，则设置 obj 的内部属性 [[Prototype]] 值为内建构造函数 Object 的 prototype 值（函数 prototype 属性可以被改写，如果改成非对象类型，obj 的 [[Prototype]] 就指向 Object 的原型对象）
>> 8. 调用函数 F，将其返回值赋给 result；其中，F 执行时的实参为传递给 [[Construct]]（即 F 本身） 的参数，F 内部 this 指向 obj；
>> 9. 如果 result 是 Object 类型，返回 result；
>> 10. 如果 F 返回的不是对象类型（第 9 步不成立），则返回创建的对象 obj

上面的描述过于复杂，下面这个过程是精简版：
>> 1. 创建新对象 o；
>> 2. 给新对象的内部属性赋值，关键是给[[Prototype]]属性赋值，构造原型链（如果构造函数的原型是 Object 类型，则指向构造函数的原型；不然指向 Object 对象的原型）；
>> 3. 执行函数 Foo，执行过程中内部 this 指向新创建的对象 o；
>> 4. 如果 Foo 内部显式返回对象类型数据，则，返回该数据，执行结束；不然返回新创建的对象 o。

[参考这篇文章](https://juejin.im/post/5b397b526fb9a00e5d7999a4)

16. 理解es6 class构造以及继承的底层实现原理
> 答：用 ES5 实现一个 class，手写一个例子来
>> 只要记住 class 相比 function 的 6个不同点即可：
>>> 1. 类的声明不会被提升
>>> 2. 类声明中所有代码会自动运行并锁定在严格模式下
>>> 3. 类的所有方法都是不可枚举
>>> 4. 类的所有方法内部都没有 [[Construct]] 属性，因此使用 new 来调用它们会抛出异常
>>> 5. 调用类构造函数时必须使用 new，否则会抛出异常
>>> 6. 试图在类的方法内部重写类名，会抛出异常
> extends 是基于原型模式实现。这边需要特别理解下 super 的用法, super 的引用是固定，跟对象方法的内部属性 [[HomeObject]] 有关

### 作用域和闭包

17. 理解词法作用域和动态作用域
> 答：词法作用域也就是静态作用域，作用域在函数创建时就确定好，不会因为调用方式不同而发生改变；动态作用域跟函数的调用方式有关，会依赖于调用时的上下文。JS 是采用词法作用域；java是采用动态作用域。

18. 理解JavaScript的作用域和作用域链
> 答：easy

19. 理解JavaScript的执行上下文栈，可以应用堆栈信息快速定位问题
> 答: easy

20. this的原理以及几种不同使用场景的取值
> 答：this 的值是动态确定，跟函数的调用方式有关。另外构造函数的 this 需要特别区分下。

21. 闭包的实现原理和作用，可以列举几个开发中闭包的实际应用
> 答: 实现原理就是作用域链。作用：通常用于保护内部属性。实际应用：高阶函数都是闭包的实际应用，还有 React Hooks

22. 理解堆栈溢出和内存泄漏的原理，如何防止
> 答：堆栈溢出：由于函数调用会往栈里面存储变量，参数等数据，这些数据都会占用内存空间，一旦内存空间被占用没了，就会导致数据越界，覆盖了别的数据。常见的场景就是无限递归调用。解决办法是采用尾递归优化。
> 内存泄漏：申请的内存空间没有被正确释放，而且指向这块内存空间的指针不再存在，导致后续程序里这块内存被永远占用。解决办法当然是 GC 了，交给 JS 引擎去做。

23. 理解模块化解决的实际问题，可列举几个模块化方案并理解其中原理
> 答：模块化主要解决的是全局变量的问题，还有一个就是模块依赖的问题。模块化方案：AMD (requirejs), CMD, UMD, CommonJS, ES module
>> CommonJS：nodejs 是这个规范的主要实践者，通过 module, exports, require, global 来支持模块化，采用同步的方式加载依赖。主要用在服务端
>> AMD：requirejs 是这个规范的主要实践者，AMD规范采用异步方式加载模块。AMD 推崇依赖前置、提前执行依赖。主要用在浏览器端。用 define 定义一个模块，用 require 引用模块
>> CMD: sea.js，这个用的比较少；CMD推崇依赖就近、延迟执行。主要用在浏览器端
>> ES module: import, export, 在语言标准层面实现模块功能，旨在统一服务端和浏览器端的通用模块解决方案。

### 执行机制

24. 为何try里面放return，finally还会执行，理解其内部机制
> 答：在try-catch的机制中，当try或者catch中有return，都会先执行finally里的代码，并且finally中没有return才会去执行try或者catch中的return。这个问题可以参考[这篇文章](https://github.com/youstde/blog/issues/33)

25. JavaScript如何实现异步编程，可以详细描述EventLoop机制
> 答：EventLoop 是实现 JS 异步的关键，所有异步回调都会被压入事件队列中，等 js engine 空闲时，从队列中头部获取回调函数，然后执行

26. 宏任务和微任务分别有哪些
> 答：宏任务：I/O 操作，setTimeout，setInternal, setImmediate, requestAnimationFrame
> 微任务： process.nextTick， MutationObserver， Promise.then catch finally

27. 可以快速分析一个复杂的异步嵌套逻辑，并掌握分析方法
> 答: 可以跳过

28. 使用Promise实现串行
> 答：基本思路就是在 promise then 里返回另外下一个 promise，这样就实现依次执行

29. Node与浏览器EventLoop的差异
> 答：这个要研究

30. 如何在保证页面运行流畅的情况下处理海量数据
> 答：使用 webworker，新开一个 worker 单独执行数据处理，不影响主线程

### 语法和API

31. 理解ECMAScript和JavaScript的关系
> 答: easy

32. 熟练运用es5、es6提供的语法规范
> 答：easy

33. 熟练掌握JavaScript提供的全局对象（例如Date、Math）、全局函数（例如decodeURI、isNaN）、全局属性（例如Infinity、undefined）
> 答：easy

34. 熟练应用map、reduce、filter 等高阶函数解决问题
> 答：easy

35. setInterval需要注意的点，使用setTimeout实现setInterval
> 答：setInterval 需要注意的点：应该说的是 callback 执行的时间比 delay 的时间长，这种情形会导致后续的 callback 被丢弃
> setTimeout 和 setInterval 互相实现，参考 wheel_js 文件 (这边可以进一步考察如何实现 clearInterval )

36. JavaScript提供的正则表达式API、可以使用正则表达式（邮箱校验、URL解析、去重等）解决常见问题
> 答：需要加强 (面试中一般不会考核，优先级不高；不过实际开发中很实用)

37. JavaScript异常处理的方式，统一的异常处理方案
> 答：这是个很考验知识广度的问题，参考[这篇文章](https://cloud.tencent.com/developer/article/1408423), 大概有如下几点处理点：
>> 1. 可疑区域增加 Try-Catch：这种方式只能处理同步代码的运行时错误，不能捕获语法错误和异步错误
>> 2. window.onerror: 捕获异常能力比 try-catch 稍微强点，无论是异步还是非异步错误，onerror 都能捕获到运行时错误; 但是无法处理 语法错误；这种方式最好写在所有 JS 脚本的前面；缺点是不能捕获静态资源加载错误，网络请求错误, 还有跨域脚本等错误(可以捕获，但是得到的信息是 script error，没有什么意义)。不过可以用来捕获 iframe 里的错误。
>> 3. 全局监控静态资源异常 window.addEventListener: 这个用于捕获静态资源加载错误，比如图片或js
>> 4. 捕获没有 Catch 的 Promise 异常：全局监听 unhandledrejection, 可以捕获没有处理的 reject 异常
>> 5. VUE errorHandler 和 React componentDidCatch (errorBoundary 只适用于类组件)
>> 6. 崩溃和卡顿：使用 window 对象的 load 和 beforeunload 或者 serviceWorker
>> 7. 跨域 crossOrigin：通常出现 Script error 是因为跨域导致，这种方式可以 解决 window.onerror 无法捕获到跨域脚本错误的问题。
> 错误上报方式：
>> + 通过 Ajax 发送数据; 因为 Ajax 请求本身也有可能会发生异常，而且有可能会引发跨域问题，一般情况下更推荐使用动态创建 img 标签的形式进行上报。
>> + 动态创建 img 标签的形式
>> + 另外要考虑收集信息量过多的问题。因为这个会增加服务器压力，通常可以设置采集率，来减轻服务器压力
>> + 还有线上脚本通常会进行压缩处理，根据行号并不好快速定位，可以利用 sourcemap 定位到错误代码的具体位置，

38. 内存管理
> stack 内存 和 heap 内存的区别
> 内存的生命周期
>> 1. 内存分配：声明变量、函数、对象的时候，系统会自动为他们分配内存
>> 2. 内存使用：读写内存，也就是使用变量、函数等
>> 3. 内存回收：使用完毕后，由垃圾回收机制自动回收不再使用的内存

39. 垃圾回收算法
垃圾回收算法的核心思想就是哪些被分配的内存确实已经不再需要了：
+ 引用计数算法：有没有其他对象引用到目标对象 (即对象是否不再需要)。
> 缺点是无法处理循环引用。(如果两个对象相互引用，即使他们已不再使用，垃圾收集器还是认为引用计数不为 0，因此不会进行回收)。老版本的 IE 是使用这种算法
+ 标记清除算法：这个算法把 "对象是否不再需要" 简化定义为 "对象是否可以获得" (现代浏览器都采用这个算法)

### JS 编码能力

1.多种方式实现数组去重、扁平化、对比优缺点
> 去重 1. loop + indexOf, 2. 排序后过滤  3. 转换成对象  4. [...new Set(arr)]
> 扁平化  1. 递归 + concat  2. reduce + concat  3. toString  4. spread + while

2.多种方式实现深拷贝、对比优缺点
> 

3.手写函数柯里化工具函数、并理解其应用场景和优势
> curry 和 parical 都要会

4.手写防抖和节流工具函数、并理解其内部原理和应用场景
> debounce (要能支持 immediate，取消， args 和 this)
> throttle

5.实现一个sleep函数
> Promise, Generator, async/await, setTimeout 总共四种方式
> 可以参考[这篇文章](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/63)

### JS 轮子能力

1. 手动实现call、apply、bind
> done

2. 手动实现符合Promise/A+规范的Promise、手动实现async await、手动实现 Generator 同步方式实现异步功能
> todo

3. 手写一个EventEmitter实现事件发布、订阅
> easy

4. 可以说出两种实现双向绑定的方案、可以手动实现
> todo

5. 手写JSON.stringify、JSON.parse
> todo

6. 手写一个模版引擎，并能解释其中原理
> 需要加强

7. 手写懒加载、下拉刷新、上拉加载、预加载等效果
> 需要多加强