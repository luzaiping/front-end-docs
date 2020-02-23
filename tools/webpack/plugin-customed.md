编写自定义的 webpack plugin
===========================

webpack plugin 是一个带有 apply 方法的 class

```js
class MyPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    console.log('This is my first plugin.');
  }
}
module.exports = MyPlugin
```
这样就实现了一个简单的 plugin。要使用这个 plugin，只需在 *.config.js 里配置
```js
module.exports = {
  .......,
  plugins: [
    new MyPlugin('Plugin is instancing.');
  ]
}
```
使用 plugin，需要通过 new 构建实例，options 就是给 plugin 的参数。

plugin 的实例化，是在 webpack 初始化所有参数的时候，也就是事件流开始的时候。

## Tapable

自定义 webpack 事件流涉及以下步骤：

1. 引入Tapable并找到所需的hook，有 同步 hook 和 异步 hook
```js
const { SyncHook } = require('tapable');
```
2. 实例化Tapable中所需的 hook，并挂载在 compiler 或者 complication 上
```js
compiler.hooks.myHook = new SyncHook(['data']);
```
3. 在需要监听的位置使用 tap 监听
```js
compiler.hooks.myHook.tap('Listen4Myplugin', data =>  {
  console.log('@Listen4Myplugin', data)
})
```
4. 在需要广播事件的时机调用 call 方法并传入数据
```js
compiler.hooks.environment.tap(pluginName, () => {
  //广播自定义事件
  compiler.hooks.myHook.call("It's my plugin.")
})
```

现在就可以在自定义 plugin 里实例化一个 hook，并挂载在 webpack 事件流中，这样就可以让 plugin 参与到事件流中

```js
// @file: plugins/myPlugin.js
const pluginName = 'MyPlugin'
const { SyncHook } = require('tapable');
class MyPlugin {
  constructor(options) {
    console.log('@plugin constructor', options)
  }
  apply(compiler) {
    console.log('@plugin apply');
    // 实例化自定义事件
    compiler.hooks.myPlugin = new SyncHook('[data]');
    compiler.hooks.enviroment.tap(pluginName, () => {
      // 广播自定义事件
      compiler.hooks.myPlugin.call('It is my plugin.');
      console.log('@environment');
    })
    // compiler.hooks.complication.tap(pluginName, (compilation) => {
      // 也可以在 complication 上挂载 hook
      // compilation.hooks.myPlugin = new SyncHook(['data']);
      // compilation.hooks.myPlugin.call('It is my plugin.');
    // })
  }
}

module.exports = MyPlugin
```

在监听 plugin 里监听自定义的事件
```js
// @file: plugins/listen4Plugin.js
class Listen4MyPlugin {
  apply(compiler) {
    // 在 myPlugin enviroment 阶段被广播
    compiler.hooks.myPlugin.tap('Listen4MyPlugin', data => {
      console.log('@Listen4MyPlugin', data)
    })
  }
}
module.exports = Listen4MyPlugin
```

在 webpack 配置里引入并初始化插件实例

```js
// @file: webpack.config.js
const MyPlugin = require('./plugins/myplugin-4.js')
const Listen4Myplugin = require('./plugins/listen4myplugin.js')

module.exports = {
  ......,
  plugins: [
      new MyPlugin("Plugin is instancing."),
      new Listen4Myplugin()
  ]
}
```
输出结果：

1. @plugin constructor Plugin is instancing.  --> MyPlugin constructor
1. @plugin apply                              --> MyPlugin enviroment.tap
1. @Listen4MyPlugin It is my plugin.          --> Listen4MyPlugin myPlugin.tap
1. @environment                               --> MyPlugin enviroment.tap
1. @after-enviroment
1. @entry-point
1. @after-plugins
1. @after-resolvers
1. @before-run
1. @run

在第三步拿到了 call 方法传入的数据(It is my plugin.), 并在 enviroment 时机里输出。
