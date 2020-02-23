output
==========================

这个配置是一个 object 值，object key 有很多值，这边主要讲解几个常见的值：

### filename
This option determines the name of each output bundle. The bundle is written to the directory specified by the `output.path` option.

For a single entry, this can be a static name；But when creating multiple bundlers via more than one entry point, code splitting, or various plugins, you should use one of the following substitutions to give each bundle a unique name:
+ [name] - using entry name. 
+ [id] - using internal chunk id.
+ [hash] - using the unique hash generated for every build.
+ [chunkhash] - using hashes based on each chunks' content.
+ [contenthash] - using hashes generated for extracted content.
+ fn - using function to return the filename

```js
module.exports = {
  output: {
    filename: 'bundle.js' // 不推荐的做法
    filename: '[name].bundle.js' // [name] 对应 entry name
    filename: '[id].bundle.js' // [id] 会被 webpack 内部的 chunk id 代替
    filename: '[name].[hash].bundle.js' // [hash] 每次 webpack build 会生成一个 hash
    filename: '[chunkhash].bundle.js' // chunkhash 是基于每个 chunk content 生成
    filename: '[contenthash].bundle.js' // the hash of the content of a file, which is different for each asset
    filename: (chunkData) => chunkData.chunk.name === 'main' ? '[name].js': '[name]/[name].js';
  }
}
```
__注意__ 
+ 虽然这个选项的名称叫 filename, 而它的值是可以包含文件夹名称，比如 'js/[name]/bundle.js' 会创建对应的文件夹
+ 这个选项不会影响 output files of on-demand-loaded chunks. 这种类型文件要通过 `output.chunkFilename` 指定
+ 由 loaders 生成的文件的名称也不受这个选项影响，要指定 loader 生成的文件名称，要通过 loader's available options 来指定
+ [hash] and [chunkhash] 可以指定 hash 长度，比如 [hash:8] 表示生成的 hash 长度是 8 位(默认是 20). 也可以通过 `output.hashDigestLength` 全局配置这个值
+ 如果使用 `ExtractTextWebpackPlugin`, 要使用 [contenthash] 来获取 hash of the extracted file。使用 [hash] 或者 [chunkhash] 都会无效。

### chunkFilename
This option determines the name of non-entry chunk files. Note that these filenames need to be generated at runtime to send the requests for chunks.
这个配置项的作用没看明白，后续有新的理解再来更新内容

### path
文件输出的绝对路径，通过使用 `path.resolve()` 定义：

```js
module.exports = {
  output: {
    path: path.resolve(__dirname, 'public')
  }
}
```

### publicPath

这个选项指定指向 output directory 的 `public URL`, 即在浏览器输入对应的 `public URL` 可以访问到 output directory 中的 assets.
当使用按需加载 或者 加载外部资源，比如 图片、文件等，这个选项值很重要，如果值设置错误，就会出现 404 错误。
对于通过 runtime 或者 loaders 生成的 URL，这个选项值会被添加到 URL 前面，所以通常这个值会以 `/` 结尾
来看 publicPath 的几种情形：
```js
module.exports = {
  output: {
    // one of the below
    publicPath: 'https://cdn.example.com/assets/', // CDN (always HTTPS)
    publicPath: '//cdn.example.com/assets/',
    publicPath: '/assets/', // server-relative
    publicPath: 'assets/', // relative to HTML page
    publicPath: '../assets/', // relative to HTML page
    publicPath: '' // relative to HTML page (same directory)
  }
}
```
