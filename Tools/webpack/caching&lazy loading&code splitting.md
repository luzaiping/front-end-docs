# Caching & Lazy loading & Code splitting

  由于这3个feature的配置内容关联性比较强，因为放到一起说明。内容主要参考 webpack 官方文档，版本适用于 webpack 4

## Code splitting

### 基于 entry point 的拆分

SPA不适用这种情况， 这个先不说

### prevent duplication

这个是将重复的代码抽成单独的文件，方便应用http caching. webpack 通过 splitChunksPlugin 来实现

```javascript
{
  optimazation: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
```

通过这个配置就可以将多个chunk里重复的代码抽取到一个公共的 chunk

### dynamic import

通过 import() 动态导入所需的 module, 这个也叫 lazy loading。

### prefecthing/preloading modules

在 import() 的基础上，增加 prefetching/preloading

```javascript
import(/* webpackPrefetch: true */ 'LoginModal');
```
这个会在 html head里添加如下的代码： 
```html
<link rel="prefetch" href="login-modal-chunk.js">
```
prefetch 和 preload 的区别：

1. preloaded chunk 是和 parent chunk 并行下载。而 prefetched chunk 是在 parent chunk 下载完成后再下载
1. preloaded chunk 有中等优先级，是马上下载；而 prefetched chunk 是在浏览器空闲的时候下载
1. preloaded chunk 是紧接着 parent chunk 进行请求。prefetched chunk 是在将来某个时刻才可能会被用到
1. 不同浏览器对这2个的实现是不一样

### Bundle Analysis

拆分后，要借助工具进行分析拆分结果，进一步验证拆分结果，常见的工具有

+ webpack-chart
+ webpack-bundle-analyzer

## lazy loading

lazy loading 是在真正需要的时候才请求，有点类似 prefetch 的效果。实现 lazy loading 的前提是做好了 dynamic import 的 code splitting； react 提供了 loadable-components 来实现，另外要使用 import() 需要引入 @babel/plugin-syntax-dynamic-import

```javascript
import loadable from '@loadable/component'
import Loading from "./Loading";

const LoadableComponent = loadable(() => import('./Dashboard'), {
  fallback: Loading,
})

export default class LoadableDashboard extends React.Component {
  render() {
    return <LoadableComponent />;
  }
}
```

上面这个就实现了对 Dashboard component 的 lazy loading。具体细节参考 [react-router 文档](https://reacttraining.com/react-router/web/guides/code-splitting). 这个其实同时实现了 code splitting 和 lazy loading。 code splitting 场景更多。对于 SPA 的 lazy loading 就是对 route 进行code splitting。

## caching

### output filenames

首先要配置config，让 build 后的 chunk 名称是基于文件内容生成，也就是文件内容有变化，chunk filename 才会变

```javascript
{
  output: {
    filename: '[name].[contenthash].js', // 这个是针对 entry point chunk 的文件名规则
    chunkFileName:  '[name].[contenthash].js'  // 这个是非 entry pint chunk 的文件名规则
  }
}
```

### Extracting Boilerplate

将公用代码抽取出来，方便单独应用缓存策略，首先抽取 runtime (不知道这个是什么东西)

```javascript
{
  optimization: {
    runtimeChunk: 'single' // create a single runtime bundle for all chunks
  }
}
```

接着抽取公共 depenedencies (比如 lodash, react)

```javascript
  optimization: {
    runtimeChunk: 'single', // create a single runtime bundle for all chunks
    splitChunks: {
      cacheGroups: {
        vendor: {
          test:  /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
```

build后除了 app 的 bundle 文件之外，还有 runtime.***.js 和 vendor.***.js。

### Module Identifiers

这个的作用是app 代码变更，重新 build 后 只有 app 和 runtime 的文件名称发生变更，vendor的文件名称应该不变。这个可以通过 NamedModulesPlugin 和 HashedModuleIdsPlugin 来实现，推荐使用 HashedModuleIdsPlugin

```javascript
{
  plugins: [
    new webpack.HashedModuleIdsPlugin()
  ]
}
```