编写自定义的 webpack loader
============

webpack loader 只是一个普通的函数，接收一个文件内容(string)，返回一个处理过的内容即可：

```js
module.exports = function(content) {
  return '{};' + content;
}
```

在配置文件中使用这个 loader：

```js
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: path.resolve('./loaders/index.js'),
    options: {
      test: 1
    }
  }
}
```

这样，loader就会去匹配所有 .js 后缀结尾的文件并在内容前加上 `{};` 这样一段代码。

可以看出，这个函数其实很简单，也可以引入 babel，调用 babel(content)，就可以实现 ES6 -> ES5 的转换，可以使用 uglifyjs 对文件内容进行压缩处理

## 常见实战技巧

### 获取 loader options

通常会为一个 loader 配置对于的 options，在 loader 实现中，可以使用已经封装好的 loader-utils 来获取
```js
const loaderUtils = require('loader-utils');
module.exports = function(content) {
  const options = loaderUtils.getOptions(this);
  console.log('***options***', options);
  return '{};' + content;
}
```

### loader 导出数据的方式

默认是通过 return 导出 loader 处理后的数据，但这并不是最推荐的写法，更建议使用 this.callback 写法：

```js
module.exports = function(content){
    //return "{};" + content
    this.callback(null, "{};" + content)
}
```

this.callback 可以传入四个参数(后面两个参数可以省略)：

+ error: Error | null, 当 loader 出错时抛出一个 Error 对象
+ content： String | Buffer，经过 loader 编译后后需要导出的内容
+ sourceMap：为方便调试生成的编译后内容的 source map
+ ast: 本次编译生成的 AST 静态语法树，之后执行的 loader 可以直接使用这个 AST，省去重复生成 AST 的过程

### 异步 loader

使用 return 或者 this.callback 都是同步的方式，如果要实现异步，可以使用 aysnc/await 的方式
```js
module.export = async function(content) {
  function timeout(delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("{};" + content)
      }, delay)
    })
  }

  const data = await timeout(1000);
  this.callback(null, data);
}
```

如果 node 版本比较低，无法使用 async/await， 可以使用 this.async 来返回异步内容，这个方法同 this.callback 类似

```js
module.exports = function(content) {
  const timeout = () => {}
  const callback = this.async();
  timeout(1000).then(data => {
    callback(null, data);
  })
}
```

### loader 缓存

默认情况下，webpack 会对 loader 的执行结果进行缓存，这样能大幅度提升构建速度，尤其是使用 watch 方式构建。

```js
module.exports = function(content) {
  this.cacheable(false); // 关闭缓存，不建议这么做
  return "{};" + content;
}
```

### pitch 钩子全程传参

在 loader 中可以 exports 一个名称为 pitch 的函数，它会先于所有 loader 执行：

```js
module.exports.pitch = function(remaining, preceding, data) {
  console.log('***remaining***', remaining)
    console.log('***preceding***', preceding)
    // data会被挂在到当前loader的上下文this上,在loaders之间传递
    data.value = "test"
}
```
最重要的是第三个参数 data，可以为其挂载一些所需的值，一个 rule 里的所有 loader 在执行时都可以拿到这个值

```js
module.exports = function(content){
    //***this data*** test
    console.log('***this data***', this.data.value)
    return "{};" + content
}

module.exports.pitch = (remaining, preceding, data) => {
    data.value = "test"
}
```