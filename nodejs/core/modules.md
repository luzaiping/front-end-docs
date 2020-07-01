modules
==================

这是关于 Nodejs Modules 的文档

## 自制 Module Loader

这边实现一个简易版的 Nodejs 模块加载功能

```js
const fs = require('fs');
function loadModule(filename, module, require) {
  const wrappedSrc = `(function(module, exports, require) {
    ${fs.readFileSync(filename, 'utf8')};
  })(module, module.exports, require);`;
  eval(wrappedSrc);
}

function requireSimulator(moduleName) {
  const id = requireSimulator.resolve(moduleName);

  if (requireSimulator.cache[id]) {
    return requireSimulator.cache[id].exports;
  }

  const module = {
    exports: {},
    id
  };

  requireSimulator.cache[id] = module;
  loadModule(id, module, requireSimulator);

  return module.exports;
}

// 存储已经加载的模块内容
// 其中 key 是 resolve 后的 module 路径
// value 是 module 对象
requireSimulator.cache = {};

// 解析指定 moduleName 对应的模块路径
requireSimulator.resolve = moduleName => {
  // TODO
}
```

下面分析下这个简易版实现的功能：
+ 首先调用 resolve 函数，解析 moduleName 的完整路径 (具体算法后面展开)
+ 判断 cache 里是否已经有对应的 module 对象，如果有直接返回即可
+ 否则创建一个 module 元数据，包含 exports 对象 和 id
+ 将这个对象保存到 cache 里
+ 调用 loadModule，开始加载模块内容
+ 加载模块就是执行文件 (这边通过 eval 实现)，如果文件中也有 require，就递归调用，最后将要暴露的 API 添加到 module.exports

注意：nodejs的 模块加载函数，还包含 __filename 和 __dirname：

```js
(function(exports, require, module, __filename, __dirname) {})()
```

因此 exports, require, module, __filename, __dirname 这5个变量是属于模块级别的全局变量，并不是真正意义的全局变量(区别于 setTimeout 等变量)

## module.export VS exports

从上面的实现中很容易就能识别这两个的差异：
+ exports 只是 module.exports 的一个引用而已
+ 模块对外的 API 是添加到 module.exports 上
+ 直接将对外 API 作为 exports 的属性也没问题
+ 如果直接对 exports 进行赋值，相当于修改 exports 的引用，最终并没有将 API 添加到 module.exports

## require.cache & require.resolve

require.cache 是用于存储全局已加载模块的对象，结构如下：

```js
require.cache = {
  id1: moduleObj1,
  id2: moduleObj2,
  ...
}
```

moduleObj 是模块的返回内容，包含了 exports 属性。除了 exports 对象外，还有其他的属性，具体可以参考官方文档。

这边 id 是模块的识别名称，通过 require.resolve() 解析得到, 举个例子：

```js
console.log(require.resolve('fs'));
console.log(require.resolve('chai'));
console.log(require.resolve('./package.json'));
```

输出：
fs
E:\work\projects\frontEndBasic\node_modules\chai\index.js
E:\work\projects\frontEndBasic\package.json

nodejs 核心模块直接返回不带路径信息的模块名称
第三方模块 和 相对路径的文件，解析出来的文件名称是一个完整路径

同一个模块，不同版本，通过 npm 安装，最终是装在不同目录下，通过 resolve 得到的标识名称也就不同，因此可以被分别加载和存储。

__注意__：
+ require.resolve 只是解析模块标识，并不会真正加载模块
+ require.cache 存储了已加载模块的内容，因此每个模块只会被加载一次，后续都是直接读取cache
+ 可以通过手动设置 require.cache[id] 的值，清除指定已加载模块，但强烈不推荐这么做
+ 不区分大小写的操作系统，比如 require('./foo') 和 require('FOO')，实践上是指向同一个文件，但是 cache 会认为它们是不同模块，因此可能会加载多次。

## cycles

当碰到循环 require() 的情形，其中一个 module 可能会在还没执行完之前就先返回，这样就可以解决循环 require。看下例子：

```js
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('a done');

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');

// main.js
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done = %j, b.done = %j', a.done, b.done);
```

这边 a.js 和 b.js 互相 require，如果都执行完再返回，那么就会互相等待对方返回，一直卡住。针对这个问题，nodejs 会让其他一个 module 执行完之前就先返回：

+ main.js 先 require a.js
+ 进入 a.js, 接着 require b.js
+ b.js 又 require a.js，此时会先返回 a.js 中的部分结果 (在 require b.js 时的状态), 然后完成 b.js
+ 再返回 a.js 完成 a.js 执行
+ 最终回到 main.js

这个例子的输出结果如下：

main starting
a starting
b starting
in b, a.done = false
b done
in a, b.done = true
a done
in main, a.done = true, b.done = true

## require.main

这个会返回整个应用入口文件的 module 信息, 以上面的例子说明，main.js 打印 require.main 会打印如下内容：

```js
Module {
  id: '.',
  path: 'E:\\work\\projects\\front-end-docs',
  exports: {},
  parent: null,
  filename: 'E:\\work\\projects\\front-end-docs\\main.js',
  loaded: false,
  children: [
    Module {
      id: 'E:\\work\\projects\\front-end-docs\\a.js',
      path: 'E:\\work\\projects\\front-end-docs',
      exports: [Object],
      parent: [Circular],
      filename: 'E:\\work\\projects\\front-end-docs\\a.js',
      loaded: true,
      children: [Array],
      paths: [Array]
    },
    Module {
      id: 'E:\\work\\projects\\front-end-docs\\b.js',
      path: 'E:\\work\\projects\\front-end-docs',
      exports: [Object],
      parent: [Module],
      filename: 'E:\\work\\projects\\front-end-docs\\b.js',
      loaded: true,
      children: [Array],
      paths: [Array]
    }
  ],
  paths: [
    'E:\\work\\projects\\front-end-docs\\node_modules',
    'E:\\work\\projects\\node_modules',
    'E:\\work\\node_modules',
    'E:\\node_modules'
  ]
}
```