# 使用webpack进行性能优化

主要从下面三方面进行说明：

## 减少 resource size

### 启用 production mode

这个只对 webpack4 有用

```javascript
module.exports = {
  mode: 'production',
};
```
### 启用minification
minification又分为 bundle-level minification 和 loader-specific options

#### bundle-level minification
使用 webpack4, 这项是默认开启, 除非显示设定 mode 为 development, 或者设置 optimization.minimize 为 false. 这个 minification 会将bundle后的文件去除掉不必要的空格，换行，注释等等。底层是通过 [UglifyJS minifier](https://github.com/mishoo/UglifyJS2) 来实现

#### loader-specific options
这个是给指定的loader设置options信息，前提是给定的loader支持，比如 css-loader 对 css 文件的minify
```javascript
{ loader: 'css-loader', options: { minimize: true } }
```
### 设置 NODE_ENV=production

很多代码都有根据 process.env.NODE_ENV 的 判定语句，从而多一些检测和警告的代码。 webpack4 配置：

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    nodeEnv: 'production', // 设置 NODE_ENV = production
    minimize: true,
  }
}
```

webpack3要这样配置：
```javascript
const webpack = require('webpack');
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
```
配置好之后， webpack build 的时候会将 process.env.NODE_ENV 替换成 'production', 因为 if('production' === 'production') z这个条件就是true, 所有 minify 碰到这样的代码，会直接移除掉

### 使用 ES module
tree shaking 只对 ES module 有用，如果使用 babel-preset-env 或者 babel-preset-es2015，babel 默认会将 ES module 转换成 CommonJS module, 要在 .babelrc 里添加如下配置来阻止 tree shaking 的时候不要转换，当然最终 bundle.js 还是会被转换
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

### optimize image
图片的优化可以使用 url-loader 和 svg-url-loader, 2个的功能类似，就是将代码里通过url引用图片的方式转换成对应的base64代码，这样就相当于把图片inline进来，从而减少http 请求数。不过如果有设置 limit, 只有大小不超过 limit 的才会被转换，超过的话还是会保留原先的引用方式。两个的区别是 svg-url-loader 只能处理 svg 格式, url-loader处理其他图片格式：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'url-loader',
        options: {
          // Inline files smaller than 10 kB (10240 bytes)
          limit: 10 * 1024,
        },
      },
    ],
  }
};
```

另外要使用 image-webpack-loader 对图片进行压缩处理, 这个loader会对所有图片格式进行处理，要配合前面2个loader一起使用：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'image-webpack-loader',
        enforce: 'pre', // This will apply the loader before the other ones
      },
    ],
  },
};
```

### optimize dependencies

谨慎过多引入 dependencies，另外有些 library 只是使用了其中一小部分功能，那就没必要全都引入进来。可以参考 [这个](https://github.com/GoogleChromeLabs/webpack-libs-optimizations), 收集了常见 library 的优化

### concatenation ES module

将 ES module 进行连接, 比如 module A 的 fnA 要引用 modle B 的 fnB, 写代码的时候，这2个函数是在各自文件里，并且通过 require 进行关联。而 webpack build 会跳过 require 语句，直接将 fnB 的内容跟 fnA 连到一起，从而减少代码量。webpack4 采用如下配置：
```javascript
module.exports = {
  optimization: {
    concatenateModules: true,
  },
};
```
__注意__ 如果是设置 mode: 'production' 那么上面的配置可以省略。

### Use externals if you have both webpack and non-webpack code

这个适用于项目里有些代码不是通过webpack进行打包, 而这些代码 和 webpack 打包的代码有共同的 dependencies, 那就需要通过 externals 这个配置项来实现

#### 如果 dependencies 是可以通过 window 对象直接访问

这种情况的话，采用如下配置:
```javascript
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
```
这个配置, webpack 不会将 react 和 react-dom 打包到 bundle.**.js, 实际代码运行会直接引用 window.React 和 window.ReactDOM

#### 如果 dependencies 是以 AMD packages 的方式被加载
按下面的方式配置：

```javascript
module.exports = {
  output: { libraryTarget: 'amd' },

  externals: {
    'react': { amd: '/libraries/react.min.js' },
    'react-dom': { amd: '/libraries/react-dom.min.js' },
  },
};
```

这样最终的bundle是打包成 amd 的形式. 格式如下：
```javascript
define(["/libraries/react.min.js", "/libraries/react-dom.min.js"], function () { … });
```
这边将 react.min.js 和 react-dom.min.js 作为 amd 的input 提供给 bundle。上面这个配置要求 webpack 里对 react 的引用是 import react from 'react'。 其中引号的 'react' 要跟 externals 的 key (react) 完全一样才行；

## 使用 long-term caching

使用 webpack 进行 long-term caching，涉及下面几个操作：

### output filenames
```js
output: {
  filename: '[name]-[contenthash].js'
}
```
filename 要指定成根据 content 生成hash。

### Extracting Boilerplate
```js
{
  optimization: {
    runtimeChunk: 'single'
  }
}
```
设置成 single，会给所有 chunks 生成一个共用的 runtime。每次 build 后, runtime 都会发生变化，如果不这么设置(值设置为 false)，那么 runtime 的代码默认是包含在最后一个 chunk 里, 这样会导致最后一个 chunk filename 每次 build 都会发生变化，哪怕它所包含的 module 没有变化。

### Module identifiers
```js
{
  optimization: {
    moduleIds: 'hashed'
  }
}
```
配置这个，确保内容没有变化的 chunk 所生成的 module id 也不会发生变化 (module id 不清楚是存在哪里，文件命上还是chunk里？)。默认 chunk id 是自增的方式，一旦有 chunk 内容发生变化，所有 chunk 的 module id 都会按顺序往上增加。


上面这三个配置是必须的，这样能确保内容没有变化所生成的 chunk filename 就不会变化，从而能有效提示 long-term caching


## 检测和分析app