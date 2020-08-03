entry
==================

## entry and context

entry 指定 webpack 构建的入口。context 是一个字符串格式的绝对路径，该路径包含了 entry files.

### context

The base directory, an `absolute path`, for resolving `entry points` and `loaders` from configuration. 

```js
module.exports = {
  context: path.resolve(__dirname, 'app')
}
```
By default the current directory is used, but it's recommended to pass a value in your configurations. This makes your configuration independent from CWD(current working directory).

__备注__ 这个配置项比较少用，理解下即可。

### entry

The point or points where to start the application bundling process. If an array is passed then all items will be processed.

这种配置有三种 syntax：

#### single Entry syntax

syntax: `entry: string | [string]`

```js
module.exports = {
  entry: './path/to/my/entry/file.js'
}
```
上面这个配置其实是下面这个配置的简写：

```js
module.exports = {
  entry: {
    main: './path/to/my/entry/file.js'
  }
}
```
这种配置生成的 chunkFileName 就是 `main`.

如果值是 [string] 是什么意思呢？

```js
module.exports = {
  entry: ['polyfills.js', 'src/index.js']
}
```
这个例子, entry 的值是 [string], 即多个 file paths 的 array, 这种配置方式会 crate what is knows as a `multi-main entry`. This is useful when you would like to inject multiple dependent files together and graph their dependencies into one "chunk".

这种配置方式也只会生成一个名称为 main 的 chunk. 具体意思还不是很理解，等后面有新的理解后再来更新。

#### Object Syntax

Syntax: `entry: { <entryChunkName>: string | [string] }`

看个例子：

```js
module.exports = {
  entry: {
    app: './src/app.js',
    adminApp: './src/adminApp.js';
  }
}
```
这种配置方式相比更繁琐些，但是更灵活。对象中的每个 Key 对应 chunkFileName, 有多个 key 就表示有多个 entry。

在 webpack 4 之前经常会将 verdors 配置成独立的 entry point 用于生成单独的 JS File (需要跟 CommonsChunkPlugin 配合使用)

从 webpack 4 开始, `optimization.splitChunks` takes care of separating vendors and app modules and creating a seperate file. `Do not` create an entry for vendors or other stuff that is not the starting point of execution. (这段话的意思是如果文件不是真正的执行入口，那就不要加到 entry 里)

#### Function Syntax

Syntax: `entry: Function`

这种语法用于创建 dynamic entry，Function 要返回 string, [string], object 值

看下各种 Syntax 对应的配置：
```js
module.exports = {
  context: path.resolve(__dirname, 'app'),
  entry: '/src.js' // one string
  // entry: { // object
  //   home: '/home.js',
  //   about: '/about.js',
  //   contact: '/contact.js'
  // },
  // entry: () => './demo', // function
  // entry: () => new Promise((resolve) => { resolve(['./demo', './demo2'])}), // function return a promise
  // entry() {
  //   return fetchPathsFromSomeExternalSource(); // returns a promise that will be resolved with something like ['src/main-layout.js', 'src/admin-layout.js']
  // }
}
```

#### Multi Page Application

```js
module.exports = {
  entry: {
    pageOne: './src/pageOne/index.js',
    pageTwo: './src/pageTwo/index.js',
    pageThree: './src/pageThree/index.js'
  }
}
```
This tells webpack that we would like 3 seperate dependency graphs.

这种配置方式，通常需要结合 `optimization.splitChunks` 用于创建多个页面中公用代码的 bundles。这样切换页面时就无需重新请求这些公用代码，能有效提示页面性能。

#### rule

entry 的配置规则是这样：
+ one entry point per HTML page
+ SPA: one entry point
+ MPA: multiple entry point