webpack
==============================

本文档主要是基于 webpack V5. 这边描述 webpack 大纲，即 webpack 都包括哪些内容，涉及哪些知识点。

## configuration

这边对一些重要或者容易混淆的配置进行说明，内容主要参考官方配置内容, 参考[链接](https://webpack.js.org/configuration/#options)

## webpack 原理

这边对 webpack 内部原理进行说明.

## runtime & mainfest

一个典型的 application 或者 site，通常主要包含下面三种类型的 code：
1. 开发人员编写的代码
2. 你的代码所依赖的第三方 library or vendor
3. webpack runtime and manifest, 用于串连所有 modules 交互

### runtime

runtime 包含了用于 loading 和 resolving 的 逻辑代码，modules 之间就是通过这些 code 实现互相交互。这个包括已经加载到浏览器的 modules，也包含通过 lazy-load 加载的 modules。

### manifest

As compiler enters, resolves, and maps out your application, it keeps detailed notes on all your modules. 这些数据集合就是 manifest, 一旦 modules 被打包成 bundle 并提供给浏览器时，runtime 就是利用 manifest 中的数据来 resolve 和 load 这些 modules. 不管采用的是哪种 module 语法，import 或者 require 语句，打包后都变成了 `__webpack__require__` 方法，这个方法会指向 module identifiers, 表示依赖于哪些 modules, runtime 会根据 identifiers 到 manifest 找到对应关系，这样就知道到哪里去获取具体的 modules 内容。

### The problem

runtime & manifest 对我们有什么影响呢？
其实大部分时间都不会有影响，尤其是开发模式，我们并不关心这两个东西。

但是一旦需要使用 浏览器缓存 来改善项目性能的时候，就会发现这两个东西很重要
比如要使用浏览器缓存机制来缓存 chunks，通常 chunk 文件名称会基于文件内容的hash来生成 (output 的 filename 配置成使用 content-chunk), 这样只要文件内容发生变化，重新 build 后的 chunk filename 就会发生变化，浏览器就知道要丢弃当前缓存，重新请求新资源。

可是有时候文件内容并没有改变，但是 hash 也发生了变化，那是 chunk 文件里包含了 manifest 和 runtime 的代码，而这些代码在每次 build 后都会发生变化。所以如果要更充分利用缓存，应该将 manifest 和 runtime 的代码抽离成单独文件，不要跟 application code 混到一起。

