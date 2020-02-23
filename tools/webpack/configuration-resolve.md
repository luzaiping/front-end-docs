resolve
============

这个配置的选项用于改变 webpack 如何解析 modules. 比如 `import 'lodash'`, resolve 配置可以改变 wepack 到哪里去查找 lodash
```js
module.exports = {
  resolve: {
    // configuration optioins
  }
}
```

## resolve.alias
创建 别名 以便更容易 import 或者 require 某些modules：
```js
module.exports = {
  resolve: {
    alias: {
      Utilities: path.resolve(__dirname, 'src/utilities/'),
      Templates: path.resolve(__dirname, 'src/templates/')
    }
  }
}

import Utility from '../../utilities/utility'; // 原先写法
import Utility from 'Utilities/utility'; // 新的写法
```

如果没有这个配置，一旦目录层级比较深，要引入外面的文件时，需要写好几个 `../` 特别繁琐。
__注意__ 
+ 配置成这种方式，在 vscode 中无法通过快捷操作方式直接跳到对应的文件
+ 通常会配置成对某个文件夹的别名，而不是具体某个文件的别名
+ 还可以在 key 后面加上 `$`，比如 `Utilities$`, 这个表示精确匹配，通常会指向一个文件，而不是文件夹，这种方式会导致 import 'Utilities/utility.js' 解析失败。由于不常用，就不展开，具体细节可以参考官方文档 [alias](https://webpack.js.org/configuration/resolve/#resolvealias)

## resolve.enforceExtension
这个配置值是 boolean 类型，默认值是false，即不要求必须指定文件后缀。比如 require('./foo') 可以解析成 foo.js 或者 foo/index.js。默认配置就是最常见的配置，正常不需要修改这个配置

## resolve.enforceModuleExtension
默认值也是 false, 这个一般是对 `loader` 起作用，比如使用 loader 时，会配置 `css-loader`, 如果配置值是 true，就可以配置成 `css`，即不写 -loader
这个配置在 webpack V5 中已经去掉了，官方不推荐修改这个值，即应该将 module extension 也写出来才更清晰。

## resolve.extensions
```js
module.exports = {
  //...
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json']
  }
};
```
指定解析哪些后缀的文件, 解析时会按这边的配置顺序，一旦匹配到某个后缀文件，后面的后缀就会被忽略了。
__注意__ 一旦配置这个值，官方默认的配置值就会被覆盖，即只有这边指定的后缀才会被解析，比如这边没有配置 `.js`,就会导致 `.js` 文件都不会被解析。

## resolve.mainFields
这个指定在引入一个 npm package 时，package.json 里中哪个字段会被 checked. 不常用

## resolve.mainField
解析目录时，哪个文件名会被使用，默认是 `index`, 比如 improt './foo' 会先解析 foo.js，如果没有，会把 foo 当成目录，尝试解析 foo/index.js。一般无需配置这个值

## resolve.modules
解析 modules，哪些目录需要被搜索，默认是 node_module。绝对路径和相对路径 的值都可以被使用；如果是相对路径，会先从当前目录查找 node_module, 如果没有就查找父目录的 node_module, 依次类推
```js
module.exports = {
  //...
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};
```
另外配置在前面的目录，优先级更高。

## resolveLoader
这个配置项的值是 object，里面的配置项跟 resolve 是一样；只是 resolveLoader 只对 webpack loader 有效，即解析 webpack loader 会根据这边的配置来解析
```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    mainFields: ['loader', 'main']
  }
};
```
