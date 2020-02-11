eslint
=========================

eslint 相关内容，主要包括 配置，自定义插件

## 配置

这部分内容主要参考官方文档，相当于是翻译，再加上平时实践中的一些理解和应用总结。

这边说的配置是基于文件形式，即使用 .eslintrc.* 或者 在 package.json 通过 eslintConfig 配置 (这个比较不常用，也不推荐)

还有一种配置方式是采用 js 注释的形式，这种是针对单行或单个文件的配置。这边不涉及这块内容。

### Parser Options

指定需要支持的 Javascript 语言选项。默认是支持 ES5 语法，可以通过对应配置项进行修改：

```js
parserOptions: {
    ecmaVersion: 2018, // 这个可以解决 spread 和 rest operator 以及 async await. 默认值是 5. 这个配置最常用
    sourceType: 'module', // 默认值是 'script', 'module' 表示使用 ES Module, 这个通常也需要配置
    ecmaFeatures: {
      globalReturn: true,  // 允许在全局作用域里使用 return 语句，这个一般不配，很少使用
      impliedStrict: true, // 允许全局的 strict mode 如果 ecmaversion >= 5
      jsx: true // supporting jsx syntax. 注意这个不表示支持 React. React 对 jsx 应用了 eslint 无法识别的特别的语义。如果要支持 React，要用 eslint-react-plugin
    }
  }
```

### Parser

Eslint 默认使用 Espree 作为它的解析器。也可以在配置文件中指定不同的 parser，只要这个 parser 满足下面的条件：

1. 必须是一个 Node module loadable。即需要通过 npm install 另外安装这个 module
1. 必须遵循 parser interface.

__注意__ 即使满足这两个条件，也不保证一个 external parser 能正确地与 eslint 一起工作，eslint 不会修复与其他 parser 不兼容的错误。

要指定一个 npm module 作为 parser，只需按下面这样配置即可

```js
{
  parser: 'esprima'
}
```

目前比较常见的 parser 有下面三个：

+ Esprima
+ Babel-ESLint - A wrapper around the Babel parser that makes it compatible with ESLint.
+ @typescript-eslint/parser - A parser that converts ts into a ESTree-compatible form so it can be used with ESLint.

__注意__ 即使指定自定义的 parser，如果使用需要非 ES5 的功能，一样需要配置 parserOptions. parserOptions 会作为参数传给 Parser, 至于 parserOptions 会不会用来开启指定功能，由 parser 决定。

### Processor

Plugins 可以提供 processor (创建自定义 plugin 时, 通过 yo eslint:plugin 时会提问是否提供 processor)。

Processor 可以从其他类型的文件中抽取 js 代码，从而让 ESLint 进行校验。也可以基于某些目的在 预处理中 对 JS 代码进行转换。

下面是一个简单的 processor 配置

```js
{
  plugins: ['a-plugin']
  processor: 'a-plugin/a-processor'
}
```

由于 processor 是属于 plugin, 因此必须配置了对应的 plugin, 然后 processor 的值采用 plugin-name/processor-name 的形式。

如果要指定 processor 应用于特定的文件类型，需要结合 overrides 进行配置：

```js
{
  plugins: ['a-plugin'],
  overrides: [
    {
      files: ['*.md'],
      processor: 'a-plugin/a-processor'
    }
  ]
}
```

关于 processor 还有其他的内容，由于这个配置项在实践应用中不常见，暂时先了解到这边。后续如果有接触其他内容再来更新。

### Environments

指定运行环境，每一个环境都会预定义一些全局变量，可用的环境有：

+ browser - 浏览器全局变量
+ node - Node.js 全局变量和作用域
+ commonjs - commonjs 全局变量和作用域 (如果是 browser-only code that uses Browserify/Webpack, 就使用这个)
+ shared-node-browser - browser 和 node.js 都共用的全局变量 ( browser 和 node 的交集)
+ es6 - 开启所有 es6 功能，除了 modules (这个会自动将 parserOptions 里的 ecmaVersion 设置为 6 / es2015)
+ es2017 - adds all ECMAScript 2017 globals and automatically sets the ecmaVersion parser option to 8.
+ es2020 - adds all ECMAScript 2020 globals and automatically sets the ecmaVersion parser option to 11.
+ worker - web worker global variables.
+ amd - defines require() and define() as global variables as per the amd spec.
+ mocha - 添加所有 mocha 的测试全局变量
+ jest - Jest global variables.
+ jquery - jQuery 

还有其他配置项，由于不常用就不列出来。这些配置项是不互斥，所以可以一次定义多个值：

```js
{
  env: {
    browser: true,
    node: true,
    jest: true
  }
}
```

也可以指定 plugin 的 enviroment, 需要先在 plugins 里指定 plugin name, 然后使用 unprefixed plugin name, 后面再跟上 / 和 environment name：

```js
{
  plugins: ['example'], // 指定 plugin
  env: {
    "example/custom": true // example 是 plugin name，custom 是 enviroment name.
  }
}
```

### globals

ESLint 默认的 `no-undef` rule 会对那些可以使用但是没有事先定义的变量提示警告，要解决这个问题，就需要配置 globals, 可以为每一个变量指定是 readonly 或者 writable

```js
{
  globals: {
    "var1": "writable",
    "var2": "readonly"
  }
}
```
