webpack configuration
===========================

本文档描述 webpack 配置信息，文档是基于 webpack V5；内容主要参考官方配置内容, 参考[链接](https://webpack.js.org/configuration/#options)
这边主要讲解一些比较简单的配置项，复杂的配置项单独一个文档，文件名称为 `configuration-*.md`

## mode

这个选项的配置如下：

```js
module.exports = {
  mode: 'production'
}
```

默认值是 `production`, 还可以配置 `development` 和 `none`, 每个配置值；不同配置值，webpack 会对打包进行不同程度的优化。

+ development - 会在 DefinePlugin 设置 process.env.NODE_ENV 值为 `development`; 另外会启用 NamedChunksPlugin 和 NamedModulesPlugin
+ production - 会在 DefinePlugin 设置 process.env.NODE_ENV 值为 `production`；另外会启用 FlagDependencyUsagePlugin、FlagIncludedChunksPlugin、TerserPlugin 等7个 plugin
+ none - 设置这个值会关闭默认优化配置项

__注意__: 设置 product.env.NODE_ENV 不会自动设置 mode 值，反过来设置 mode 为 development 或 production 会自动设置 product.env.NODE_ENV

通常会为每个项目创建对应的 dev 和 prod 配置文件，在对应的配置文件中配置这个选项。

## target
这个配置项用于指定将代码打包成特定环境或者target.
可以指定 string 或者 function。

支持的 string 值有：
+ web - 编译成在类浏览器的的环境中使用, 这个是默认值
+ node - 编译成在类 nodejs 的环境中使用 (使用 Node.js 的 require 来加载 chunks)
+ webworker - 编译成 webworker
还有另外一些值，由于这个配置项不常用，就不展开

如果上面预定义的 targets 不能满足要求，就使用 function 形式; function, 会接收一个 compiler 的参数。
```js
module.exports = {
  target: () => undefined // 这种配置的话，就不会应用任何 plugins 
  target: (compiler) => { // 指定要使用的特定 plugins
    compiler.apply(
      new webpack.JsonpTemplatePlugin(options.output),
      new webpack.LoaderTargetPlugin('web')
    )
  }
}
```

## externals

externals 配置项提供了一种方式，用于将指定 dependencies 从 output bundle 中排除掉，即不将指定 dependencies 打包到 output bundle. dependencies 会出现在终端用户的运行环境中，output bundle 通过这种方式来 import dependencies.
以 jquery 为例：
```html
<script
  src="https://code.jquery.com/jquery-3.1.0.js"
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
  crossorigin="anonymous">
</script>
```
```js
module.exports = {
  externals: {
    jquery: 'jQuery'
  }
};
```
```js
import $ from 'jquery';
$('.my-element').animate(/* ... */);
```

在最后一段代码中 `import $ from 'jquery'` 依赖 jquery, 正常 webpack 打包, 会将 jquery 打包到 output bundle 中。如果采用第二段代码的配置方式，就是不将 jquery 这个 package 打包到 output bundle。但是代码实际是需要依赖 jquery，这时候就需要在运行环境中，比如这个例子在浏览器中通过 script 引入 jquery，这样就能解决依赖问题，同时又不会增加 output bundle 的大小。注意这个例子中 `jQuery` 表示在浏览器中可以通过这个变量使用 jquery 这个 library

## Node

这个配置项可以指定是否要对一些 Nodejs globals 和 modules 进行 polyfill 或者 mock。这个允许本来是用于允许在nodejs环境的代码，可以在其他环境运行，比如 browser
这个功能是通过 webpack 内部的 `NodeStuffPlugin` 插件支持。

node 可以指定的值有 false | object

```js
module.exports = {
  node: false // 这种情况会完全关闭 NodeStuffPlugin and NodeSourcePlugin plugins
  node: {
    __filename: true, // provide a polyfill
    fs: false, // 什么都不提供。代码中如果引用这个会报 ReferenceError. 尝试 import module 会导致 cannot find module "modulename" error.
    __dirname: 'mock', // 提供一个实现了期望的接口但是拥有很少功能甚至没有功能
    global: 'empty', // 提供一个空对象
  }
}
```