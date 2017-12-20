# loader

这边编写关于loader的使用总结

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