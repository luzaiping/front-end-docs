module
=========================

这个配置里的选项决定项目中不同类型的 webpack modules 会被如何处理.

## webpack modules

webpack modules can express their dependencies in a variety of ways:
+ An ES2015 import statement
+ A CommonJS require() statement
+ An AMD define and require statement
+ An @import statement inside of a css/sass/less file.
+ An image url in a stylesheet url(...) or HTML <img src=...> file.

## module.noParse

这个配置项可以阻止 webpack 解析匹配正则表达式的任何文件。被忽略的文件不可以调用 import、require、define 或者其他 importing mechanism. 这个可以帮助构建性能，尤其是忽略大的文件
```js
module.exports = {
  module: {
    noParse: /jquery|lodash/,
    noParse: (content) => /jquery|lodash/.test(content)
  }
}
```
这个选项不常用

## module.rules

An array of Rules which are matched to requests when modules are created. 这些 rules 可以修改 modules 是如何被创建。可以对 module 应用 loaders, 或者修改 parser

## Rule
是一个对象，分为三个部分 - Conditions, Results and nested Rules.

### Rule Conditions

conditions 有两种 input value：
+ the resource: 请求文件的绝对路径
+ the issuer: 请求 resource 的文件绝对路径，即发起 import 的位置

比如在 app.js 中包含 `import './style.css'`, the resource 就是 style.css 这个文件的绝对路径, the issuer 就是 app.js 这个文件的绝对路径
在一个 Rule 对象中, `test`, `include`, `exclude` 和 `resource` 是匹配 `the resource`; `issuer` 是匹配 `the issuer`

### Rule results

当匹配 Rule Condition, Rule results 才会被使用。有两种 Rule result:
+ Applied loaders: An array of loaders applied to the resource.
+ Parser options: An options object which should be used to create the parser for this module.

`loader`, `options`, `use` 这几个会影响 loaders，`query` 和 `loaders` 这两个不推荐使用的属性也会影响 loaders. 
`enforce` 会影响 loader category. 不管是 normal, pre- or post-loader
`parser` 会影响 parser options.

### Nested rules

Nested rules 可以用在 `rules` 和 `oneOf` 这2个属性下面。Nested rules 只有在 parent Rule condition 匹配时才会被应用。每一个 nested rule 可以包含自己的 conditions.
The order of evaluation is as follow:
1. The parent rule
1. rules
1. oneOf

### Rule.enforce

指定 loader category, 可以设定 `pre` or `post`, 如果没有指定就是 normal loader.

### Rule.exclude/ Rule.include / Rule.test

这3个分别是 Rule.resource.exclude, Rule.resource.include, Rule.resource.test 的简写，指定任何一个都不可以再设置 Rule.resource.
在应用一个 Rule 时, exclude 的优先级最高，匹配 exclude 的文件，哪怕 test 或 include 匹配，也不会被应用。

### Rule.loader / Rule.options / Rule.query

Rule.loader 是 `Rule.use: [{ loader }]` 的简写. 即一个 Rule.loader 就是 Rule.use 中的一个元素对象中的 loader.
Rule.options 和 Rule.query 是 `Rule.use: [{ options }]` 的简写。Rule.query 已经废弃了，不建议使用，推荐用 Rule.options

结合 Rule.loader 来看个例子
```js
module.exports = {
  module: {
    rules: [
      test: /\.jpe?g$/,
      loader: 'url-loader',
      options: {
        limit: 11000,
      }
    ]
  }
}
```
这个例子等同于下面配置：
```js
module.exports = {
  module: {
    rules: [
      test: /\.jpe?g$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 11000,
          }
        }
      ]
    ]
  }
}
```

### Rule.oneOf

An array of Rules from which only the first matching Rule is used when the Rule matched. 即如果有多个匹配了，只有第一个匹配会被使用
```js
module.exports = {
  module: {
    rules: [
      test: /\.css$/,
      oneof: [
        {
          resourceQuery: /inline/, // foo.css?inline
          use: 'url-loader'
        },
        {
          resourceQuery: /external/, // foo.css?external
          use: 'file-loader'
        }
      ]
    ]
  }
}
```
这个例子，会对 css 文件进行处理，如果请求 css 的 url 带有 inline 这个 query 就使用 url-loader, 如果带有 external query 就使用 file-loader