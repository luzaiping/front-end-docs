# loader

这边编写关于loader的使用总结

## 实现 loader

A loader is a node module exporting a function.

在这个函数里对 代码内容进行处理. 如果多个 loaders 对同一种资源进行 chain 式处理，配置在最下面的 loader 是最先执行处理，然后再往上执行。

只有第一个 loader 的 function 可以接收2个参数：第一个是 content, 第二个是 sourceMap; 后面的 loader function 接收的参数是 前一个loader function 的返回值(已被前一个loader处理过的内容)

```javascript
module: {
    rules: [{
        test: /\.js/,
        use: [{ loader: 'barLoader' }, { loader: 'fooLoader' }]
    ]
}
```

比如上面这个配置，先执行 fooLoader, 接收的 content 是最初的 JS 内容；处理完后将内容返回作为 barLoader 的输入参数。

另外 webpack 默认只搜索 node_modules 下面的文件夹或者loaders。如果 loader 定义在外面，要使用 resolveLoader 解析 loaders 目录，通过下面的配置来实现：

```javascript
resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')] // 这边加载node_modules 和 loaders文件夹的内容作为 loaders
}
```

或者在 resolveLoader 里添加一个 alias, 然后在 loader 里正常引用
```javascript
resolveLoaer: {
    alias: {
        'parent-scope-loader': path.join(__dirname, 'loader', 'parentScopeLoader.js')
    }
}
```
这样 module.rules 里 loader 配置就可以直接引用 parent-scope-loader

```javascript
use: ['style-loader', 'css-loader', 'postcss-loader', 'parent-scope-loader']
```
比如这个对css的处理，处理顺序是： parent-scope-loader -> postcss-loader -> css-loader -> style-loader

来看下 parent-scope-loader 的实现：

```javascript
module.exports = function parentScopeLoader(source) {
  return '.parent { ' + source + ' }'
}
```
将原先 css 内容包装在一个 parent class 里面

再看一个例子：

```javascript
module.exports = function(content) {
    this.cacheable && this.cacheable();
    this.value = content;
    return "module.exports =" + JSON.stringify(content); // 对原先内容进行 stringify 处理，并且 返回 给下一个loader使用
}
module.exports.seperable = true
```

## 常见loader的使用

### css-loader

这个 loader 主要是用于支持 css module. 通常会跟 style-loader 一起使用，看下常见的配置

```javascript
{
    test: /\.css$/,
    use: [
            {
                loader: 'css-loader',
                options: {
                    modules: true, // 开启 css module 支持
                    importLoaders: 1, // @import 指令执行时，需要在css-loader前先运行几个loader, 1 表示一个，这个loader要配在css-loader后面
                    localIdentName: '[name]__[local]___[hash:base64:5]' // css module 类名的格式 name(文件名称) local:类名 后面那串是唯一的识别码
                }
            }
    ]
}
```

开启 css module 后, js 里要使用 css class 要通过下面的方式来引用

``` javascript
import styles from './style.css' // 启用 css module，引用class的方式

element.classList.add(styles.hello)  // 通过 styles 对象获取 style.css 文件里定义好的 class
```

这样最终html文件里，看到使用这个css class的元素，对应的class值就是会是 style__hello__xxxxx 的形式，其中 style 就是 css 文件名, hello 是 css class 名称, xxxxx 是随机的5位hash值

css-loader 也可以用于非 css-loader 的情况，其实默认就是非 css-module，来看下配置：

```javascript
{
    test: /\.css/,
    use: ['style-loader', 'css-loader']
}
```

这种配置，就是不设置 css-loader 的 options 信息。不启用 css-module，js 里要使用 css class 要采用下面的写法：

```javascript
import './style.css' // 没有启用css module，引用class的方式
element.classList.add('hello')
```

这样最终html里，element 里配置的class值就是 hello, 这等于是一个全局的class name，没有module的信息了; 另外要注意是直接 import css 文件了。

上面的配置方法，没有将最终生成的样式抽取成独立的css文件，所以不管是全局的样式，还是module的样式，最终都是以 inline style 的形式存在于 html 的 head，全局和module的唯一区别，只是类的名称不一样而已。__如果是开发环境，通常是不对css样式进行抽取，但是生成环境是强烈建议要抽取成css文件__

如果要将样式抽取成css文件(抽取成css文件，可以充分利用浏览器并行下载文件的优点，同时如果css很少变化，也可以对其进行缓存处理；不过首次加载速度可能没有inline style快，critical rendering path)，就得使用 extract-text-webpack-plugin 这个 plugin，这边不展开对这个 plugin 的介绍，具体参考 plugin.md，来看下如何结合css-loader 和 这个 plugin：

```javascript
modules: {
    rules: [
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract(
                {
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true, // 开启 css module 支持
                                importLoaders: 1, // @import 指令执行时，需要在css-loader前先运行几个loader, 1 表示一个，这个loader要配在css-loader后面
                                localIdentName: '[name]__[local]___[hash:base64:5]' // css module 类名的格式 name(文件名称) local:类名 后面那串是唯一的识别码
                            }
                        }
                    ]
                }
            )
        }
    ]
},
plugins: [
    new ExtractTextPlugin({
        filename: 'app.[contenthash].css' // css 文件名的格式, 文件名用hash，就得用 html-webpack-plugin，这样才会在head里自动引用该文件
    })
]
```

通过这样的配置后，css样式最终会被抽取成css文件，以 <link href='xxx.css'/> 的形式引用

另外这边配置最终抽取的css文件名格式，由于采用了contenthash 的形式，所以只要内容发生变更，每次抽取的文件名称都不一样，因此不能再html模板文件里直接指定文件名；这时候就得使用另外一个plugin：html-webpack-plugin。来看下 html-webpack-plugin 的相关配置：

```javascript
new HtmlWebpackPlugin({
    title: 'webpack-demo', // 最终生成的 html 文件的 title
    filename: '../build/index.html', // 最终生成的 html 文件路径和文件名
    template: path.resolve(__dirname, 'index.template.html'), // html模板文件，用于生成最终的html文件。这里无需指定 link tag
    inject: 'body' // 指定生成的entry point chunk 要插入到 html 文件的哪个位置
})
```

这个 plugin 的介绍请参考 plugin.md 文件。

### file-loader, url-loader, image-webpack-loader

这3个loader相关性比较高，尤其是前面2个，这边分别说明用法和注意事项

#### file-loader

这个 loader 用于将代码中引用的资源文件(比如image, font)拷贝到最终build的文件夹里。被拷贝的文件名称由options的name属性指定。代码中我们按正常的方式引用资源文件，通过这个loader处理后，最终生成的html文件里看到的资源文件引用地址会变成文件在build文件夹里的url。

来看下最常见的配置内容：

```javascript
{
    test: /\.(png|svg|jpg|gif)$/,
    use: [{
        loader: 'file-loader',
        options: {
            name: 'images/[hash].[ext]' // 覆盖默认的文件名称，新的文件名称将所有文件统一放到[output.path] 的 images 文件夹里
        }
    }]
}
```

这边配置代码中如果碰到对这4种后缀文件的引用(html里的引用或者css文件里引用)，这个loader会将对应文件拷贝到build文件，然后根据name配置项，生成新的文件名称