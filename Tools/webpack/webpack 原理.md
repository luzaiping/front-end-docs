webpack 原理
==============

## webpack 事件流

webpack 就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。这条生产线上的每个处理流程的职责都是单一的，多个流程之间存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。plugin 就像是插入到生产线上的一个功能，在特定的时机对生成线上的资源做处理。webpack 通过 Tapable 来组织这条复杂的生产线。webpack 在运行过程中会广播事件，plugin 只需要监听它所关心的事件，就能加入到这条生成线中，去改变生产线的运作。webpack 的事件流机制保证了 plugin 的有序性，使得整个系统扩展性很好。-- 吴浩麟《深入浅出webpack》

可以将 webpack 事件流理解成 webpack 构建过程中的一系列事件，他们分别表示不同的构建周期和状态。Tapable 类似于 EventEmit, 通过 发布者-订阅者 模式实现，核心代码可以概况成下面这样：

```js
class SyncHook {
  constructor() {
    this.hooks = {};
  }
  tap(name, fn) {
    // 订阅事件
    const fns = this.hooks[name];
    fns ? fns.push(fn) : (this.hooks[name] = [fn]);
  }
  call() {
    Object.keys(this.hooks).forEach(key => {
      this.hooks[key].forEach(fn => fn(...arguments));
    })
  }
}
```

__注意__ webpack4 重写了事件流机制，如果翻阅官方文档查看 [webpack hook](https://webpack.js.org/api/compiler-hooks/) 会发现很复杂，实际使用中，只需要记住几个重要的事件即可。

## webpack 执行流程

![webpack 执行流程](./webpack-steps.jpg)

1. 初始化参数 - 从配置文件(默认是 webpack.config.js) 和 shell 语句中读取与合并参数，得到本次构建的配置参数
1. 开始编译 (compile) - 使用上一步得到的参数初始化 compiler 对象，实例化 plugin，并将 compiler 作为参数传入 plugin 的 apply 方法，为webpack事件流挂上自定义的钩子。通过执行 compiler 的 run 方法开始执行编译
1. 确认 entry point - 根据配置中的 entry 找出所有的入口文件
1. 编译 module - 从入口文件触发，开始 complication 过程。调用配置的 loaders 对 module 内容进行编译(buildModule)。监听这个阶段 plugin 钩子，会接收参数 complication，从 complication 中可以拿到 module 的 resource (资源路径)，loaders 等信息。之后，再将编译好的文件内容使用 acorn 解析成 AST 静态语法树 (normalModuleLoader)。 再找出该模块依赖的模块，递归本步骤直到所有入口依赖的文件都经过处理，最终模块中的 require 语法会被替换成 `__webpack_require__`。
1. 完成编译 module - 经过上步，得到每个模块被转换之后的最终内容以及他们之间的依赖关系
1. 输出资源 - 根据入口和模块之间的依赖关系，组装成一个个包含 module 的 chunk, 再将每个chunk转换成一个单独的文件加入到输出列表中，这是可以修改输出内容的最后机会。监听这个阶段的 plugin，可以通过 complication.assets 获取所需的数据。
1. 输出完成 - 在确定好输出内容后，根据配置信息确定输出的路径和文件名，将文件的内容写入文件系统中。

在以上过程中，webpack 会在特定的时间点广播特定的事件，有监听了事件的 plugin 就会执行相应的回调函数；在回调函数中，plugin 可以调用 webpack 提供的 API 改变webpack的运行结果

## 总结

纵观 webpack 构建流程，可以发现构建花费的时间主要是花在递归遍历各个 entry，然后找出依赖逐个遍历编译的过程。每次递归都需要经历 String -> AST -> String 的过程，经过 loader 还需要处理一些字符串或者执行一些JS脚本。webpack4 开始会利用 nodejs 原生的 cluster 模块去开辟多线程执行构建，所以构建速度比起之前会有大大提升。(happypack 也是这么做)


