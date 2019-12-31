# optimizing js

## reducing javascript payloads with tree shaking

图片下载下来后，只需要经过 decode 处理就可以在浏览器里显示；而js 需要被解析，编译，然后运行，处理起来要更费资源。

### 什么是tree shaking

tree shaking 是用于消除代码的方式, 这个是减小 bundle size，从而减少请求时间，但是并不影响浏览器对JS的处理速度(包括 解析/编译，运行)

### 如何操作

#### 找机会 shake tree

不要将一个module所有的内容都导入进来，只导入所需的function即可。比如：

```javascript
import * as utils from ../../utils/utils;  // 这种导入方式不好，会将所有内容都导入进来
import {fn1, fn2, fn3} from ../../utils/utils; // 像这样只导入所需的函数就好
```

当然随着项目代码越来越大，并不能像上面这样简单地修改。这时候可以借用 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 或者 [source-map-explorer](https://www.npmjs.com/package/source-map-explorer) 帮忙分析

#### 别让 babel 将 ES6 modules 转化成 CommonJS modules

如果项目使用 babel-preset-env， babel 会自动将 ES6 modules 转换成兼容性更好的 commonjs modules (即用 require 代替 import)。而 tree shaking 处理 commonsjs module 会更困难，这样 webpack 就会不知道怎么对 bundle tree 进行裁剪。解决办法就是让 babel-preset-env 保留 ES6 module，只需在 .babelrc 或者 package.json 里面使用如下配置：

```json
{
  "presets": [
    [
      "env", {
        "modules": false
      }
    ]
  ]
}
```

这个配置会让 webpack 分析 dependency tree 然后 shake off 不需要的 dependencies. 而且这个配置不会导致代码兼任问题，因为 webpack 最终还是会将代码转换成更兼容的格式。

#### keeping side effects in mind

在 package.json 里添加 sideEffects property
```json
{
  "sideEffects": [
    "./src/some-side-effectful-file.js",
    "*.css"
  ]
}
```
#### Importing only what you need

这个就是只 import 实际需要用到的 fn, 不要将整个 module 都 import 进来

#### 例外

对 loadsh 应用 tree shaking, 需要做一些调整才行。有两种方法：

1. 使用 lodash-es 代替 lodash. 然后 import sortBy from "lodash-es/sortBy" 而不是 import { sortBy } from "lbodash"
2. 添加 [babel-plugin-lodash](http://babel-plugin-lodash/) 这个 plugin 到 babel config, 然后就可以正常使用ES6的import方法

有时候会碰到一些难于处理的library，这些library会无法应用 tree shaking, 可以查看下是否是使用了 module.exports = {} 的格式，webpack 是无法处理 commonJS 的语法。所以如果要充分使用 tree shaking 就要应用ES6 module

#### 总结

在 webpack 中应用 tree shaking 的条件：

1. 使用 ES6 的 import 和 export 
1. 确保没有 compilers (比如babel) 将 ES module 转换成 commonJS module (配置 module 为 false)
1. 在 package.json 里添加 sideEffects property, 通常设置为 false 能满足大部分场景
1. 设置 mode 为 production, 这个会应用各种优化，比如 minification 和 tree shaking

## reducing javascript payloads with code splitting

1. 有不少站点会将所有js代码都组合到一个大的bundle, 这样会导致加载慢，而且许多代码在main thread里运行，也会延迟交互性，这个对于低内存和CPU的设备会更加明显

1. 一个可选的方法就是将大的bundle进行代码拆分，拆分成多个 chunk。这样允许发送最小的代码来快速展示内容，提高页面加载时间，至于其他的 chunk，可以推迟到后台去加载执行。

1. 代码拆分可以有以下几种方式：

+ vendor splitting：将 vendor code(比如 react, lodash) 和 app code 进行拆分，这样允许对分离后的 chunk 应用不同缓存策略；vendor 很少会变更，所有可以设置更长的 max-age
+ entry point splitting： 将不相干的2个 entry point 进行独立打包。这个通常是应用在非SPA，或者是同时有client 和 server 的代码
+ dynamic splitting： 使用 dynamic import() 语句。 这种拆分方式特别适合 SPA

1. 使用代码拆分工具，比如 preact CLI, PWA starter kit

### 实现

这边说的实现是基于webpack，添加相应的 config 完成

#### 多个 entry point 的拆分

这个适合多页面的情形，即多个 html 页面，每个 html 有独立的 app, 也就有独立的 dependency tree. 比如下面的配置：

```javascript
module.exports = {
  // ...
  entry: {
    main: path.join(__dirname, "src", "index.js"),
    detail: path.join(__dirname, "src", "detail.js"),
    favorites: path.join(__dirname, "src", "favorites.js")
  },
  // ...
};
```

这边添加配置了 3个 entry，运行 webpack build，就会生成3个 chunks (名称对应 entry 里的 key)

#### vendor splitting

上面的配置，已实现多个entry的代码拆分，不过这个实现存在一个问题，那就是会存在重复的 dependencies，从而导致每个 chunks文件过大，也就是重复 dependencies 会被重复下载，从而影响加载性能，解决这个问题的办法就是将 node_modules 的dependencies 独立拆分成一个单独的 chunks：

```javascript
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Split vendor code to its own chunk(s)
        vendors: {
          test: /[\\/]node_modules[\\/]/i,
          chunks: "all"
        }
      }
    },
    // The runtime should be in its own chunk
    runtimeChunk: {
        name: "runtime"
    }
   },
  // ...
};
```

配置 optimization.splitChunks 将所有 node_modules 里的 dependencies 拆分到单独的 vendors.`***`.js 文件里。这边还配置了 optiomiztion.runtimeChunk， 这个配置项不清楚是什么意思。 运行 build 后会生成一个 runtime.***.js 文件。

上面的配置会将 entry 的所有依赖(不管这个dependency是被一个或多个entry引用) 都抽成 vendors.***.js 文件。不过3个 entry 里可能还包含一些重复的 app code. 更彻底的做法是将这些 app code 也拆分出来：

```javascript
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Split vendor code to its own chunk(s)
        vendors: {
          test: /[\\/]node_modules[\\/]/i,
          chunks: "all"
        },
        // Split code common to all chunks to its own chunk
        commons: {
          name: "commons",    // The name of the chunk containing all common code
          chunks: "initial",  // TODO: Document
          minChunks: 2        // This is the number of modules
        }
      }
    },
    // The runtime should be in its own chunk
    runtimeChunk: {
      name: "runtime"
    }
  },
  // ...
};
```

在 optimization.splitChunks.cacheGroups 里增加一个 commons 配置项, 制定对应的 name 和 minChunks；其中 minChunks 的意思是代码至少在2个 chunks 里重复，才需要拆分出来。再次 build 后，会生成一个 commons.`***`.js 文件，这个文件包含了 node_modules 里的 dependencies，还有各个 chunks 里的重复代码。而原先的 vendors.`***`.js 文件不见。相比于前面的配置，commons.`***`.js 要比 vendors.***.js 文件大，但是3个entry对应的 chunks 文件变小了。这种拆分方式个人觉得要慎重，如果是多个chunks里面的重复代码比较多，那是值得这么做，但是如果不是很多，感觉就没必要，毕竟将 app code 和 vendors 拆分到一起，不利于应用缓存

#### dynamic splitting

动态拆分是利用ES6的 dymaic import 语句来实现，这个其实就是 lazy load 的一种实现情形。

```javascript
import("./myFancyModule.js").then(module => {
  module.default(); // Call a module's default export
  module.andAnotherThing(); // Call a module's named export
});
```
上面代码会动态加载 myFancyModule.js 文件，也就是真正需要用到这个文件时，才会单独去请求下载。好处就是如果不需要就永远都不会加载，可以有效加快首次页面的加载速度(包括 js 的下载、parse、compile)；不好的就是需要执行一个单独的网络请求。import() 会返回一个 promise，所以可以使用 async/await 来改下上面代码：
```javascript
let module = await import("./myFancyModule.js");
module.default(); // Access a module's default export
module.andAnotherThing(); // Access a module's named export
```

这种拆分方式一般应用在router上面，也就是基于route进行拆分，只有对应route被触发了，才需要去加载：

```javascript
class App extends React.Component {
  render(<Router>
    <Search path="/" default/>
    <AsyncRoute path="/pedal/:id" getComponent={() => import(/* webpackChunkName: "PedalDetail" */ "./components/PedalDetail/PedalDetail").then(module => module.default)}/>
    <AsyncRoute path="/favorites" getComponent={() => import(/* webpackChunkName: "Favorites" */ "./components/Favorites/Favorites").then(module => module.default)}/>
  </Router>, document.getElementById("app"));
}
```

上面是 preact 和 webpack 结合实现 dynamic splitting。 /* webpackChunkName: "PedalDetail" */ 用于指定 build 后的 chunck name。如果没有指定，就会生成数字名称的文件。

### 加载性能的考虑

code splitting 的一个可能痛点就是会增加 http requrest 的次数。

#### budget

如果使用 webpack, 可以添加一个 performance 配置项：

```javascript
module.exports = {
  // ...
  performance: {
    hints: "error",
    maxAssetSize: 102400
  }
};
```

一旦build的时候，某个asset的大小超过 100kb 就报错，这个数值可以根据实际项目情况进行调整。这个配置有利于控制chunk的大小，performance 还有其他可配置项，比如 maxEntrypointSize

#### 使用 service worker 进行预缓存

在初始化后使用 serviceWorker precache 剩下的路由和功能可以显著改善性能：

1. 不会影响 init loading, 因为 service worker 的 registration 和 接下来的 precaching 是发生在 页面加载 完成后
1. precaching remaing routes and functionality with a service worker 确保之后对他们的请求能够立即可用(已经缓存下来了)

可以使用 [workbox](https://developers.google.com/web/tools/workbox/) 的 webpack plugin [workbox-webpack-plugin](https://www.npmjs.com/package/workbox-webpack-plugin) 来生成一个 service worker 帮助快速实现：

```javascript
const { GenerateSW } = require("workbox-webpack-plugin");
module.exports = {
  // ...
  plugins: [
    // ... other plugins omitted
    new GenerateSW()
  ]
  // ...
};
```

这个配置 workbox 生成的 service worker 会 precache 应用中所有的 JS, 对于小的应用，这样配置还可以；对于大的应用，就得限制 precache 的内容；可以通过设置 plugin 的 options 参数
```javascript
module.exports = {
  plugins: [
    new GenerateSW({
      chunks: ["main", "Favorites", "PedalDetail", "vendors"]
    })
  ]
};
```
这个设置 service worker 要 precache 的 白名单

#### preload & prefetch

通过 service worker precache scripts 是一种增强式的改进方法。如果无法使用这种方式，可以考虑使用 preload 和 prefetch。

rel=preload 和 rel=prefetch 是属于对资源获取的提示，提示浏览器在真正用到资源前就进行请求。这2个有不同的意思：

1.rel=prefetch 是属于低优先级的fetch，用于获取不是很重要的资源，只有在浏览器空闲的时候才会执行
1.rel=preload 是属于高优先级的fetch，用于获取当前路由的重要资源，这个通常在浏览器识别到之后就马上进行请求

webpack 都提供了对这2种方式的支持。具体参考 [google developer](https://developers.google.com/web/fundamentals/performance/optimizing-javascript/code-splitting/#prefetching_and_preloading_scripts).