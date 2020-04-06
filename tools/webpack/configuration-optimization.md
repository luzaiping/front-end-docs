optimization
======================
从 webpack4 开始, webpack 会基于配置的 mode 对构建进行优化；同时也支持手动配置 optimization 信息

## optimization.minimize
`boolean`

这个配置项告诉 webpack 使用默认的 `TerserPlugin` 或者使用由 `optimization.minimizer` 配置的 plugin 对 output bundle 进行 minimize 处理。

设置 production mode, 这个配置项默认就是 true
```js
module.exports = {
  optimization: {
    minimize: true
  }
}
```

## optimization.minimizer
`[TerserPlugin] and or [function(compiler)]`

通过提供一个不同的 plugin 或者 更自定义的 TerserPlugin 实例来对覆盖默认的 minimizer
```js
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
  optimization: {
    minimizer: [ // 是个数组类型
    // production mode，这个也得显示配置，不然是不会 minify
      new TerserPlugin({ // TerserPlugin 对象
        cache: true,
        paraller: true,
        sourceMap: true, // Must be true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  }
}
```
或者
```js
module.exports = {
  optimization: {
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({/* your config */}).apply(compiler);
      }
    ]
  }
}
```

## optimization.runtimeChunk

`object | string | boolean`

设置 optimization.runtimeChunk 的值为 true 或者 'multiple', 会为每一个 entrypoint 生成一个只包含 runtime 的 chunk file. 相当于是下面的配置
```js
module.exports = {
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}`
    }
  }
}
```
相反如果设置值为 'single', 会生成一个 runtime file 给所有 generated chunks 共用, 相当于是下面的配置
```js
module.exports = {
  optimization: {
    runtimeChunk: {
      name: 'runtime'
    }
  }
}
```

runtimeChunk 设置为 object，是可以为 runtime chunks 文件命名的唯一方式.

__注意__ 建议设置 true 或者 multiple， 即每个 entrypoint 单独一个 runtime chunk file。

## optimization.namedModules & optiomization.namedChunks

`boolean = false`

这两个配置项主要配合开发使用，会为 module 和 chunk 生成 reabable identifiers for debugging. 如果 mode 是 development, 这个配置默认值为 true；是 production，默认值为 false

```js
module.exports = {
  optimization: {
    namedModules: true,
    namedChunks: true
  }
};
```

## optimization.moduleIds & optimization.chunkIds

`boolean = false | string = 'natural' | 'named' | 'size' | 'total-size'`

Tells wepack which algorithm to use when choosing module/chunk ids. setting to false tells webpack that none of build-in algorithms should be used, as custome one can be provided via plugin.

```js
module.exports = {
  optimization: {
    moduleIds: 'hash'
  },
  plugins: [
    new webpack.ids.DeterministicModuleIdsPlugin({
      maxLength: 5
    })
  ]
}
```

如果是配置 long caching, 这个配置项很关键。默认构建后 module id 是基于 resoling order 增加，也就是一旦有内容做了修改，重新 build 后，每个 chunk 的 filename 都会发生变化，解决这个问题的关键就是设置 `moduleIds: 'hash'` (webpack 5 使用 deterministic 代替 hash)。也可以使用 DeterministicModuleIdsPlugin。

## optimization.nodeEnv

`boolean = false | string`

这个配置项会让 webpack 设置 process.env.NODE_ENV 为指定的值。如果不是设置为 false，这个配置项会使用 `DefinePlugin`. 默认 optimization.nodeEnv 会等于 mode 的值；如果没有设置就等于 'prodution'

+ any string: the value to set process.env.NODE_ENV to.
+ false: do not modify/set the value of process.env.NODE_ENV

```js
module.exports = {
  optimization: {
    nodeEnv: 'production'
  }
}
```

## optimization.removeAvailableModules

`boolean = false`

通知 webpack 检测和移除 chunks 中的 modules，只要这些 modules 已经包含在所有 parents (没说这个 parents 是什么)。production mode 默认会将这个值设置为 true.

## optimization.removeEmptyChunks

`boolean = true`

通知 webpack 检测和移除 空的 chunks。

## optimization.mergeDuplicateChunks

`boolean = true`

通知 webpack 对 chunks 进行合并，如果这些 chunks 包含了相同的 modules。

## optimization.flagIncludedChunks

`boolean`

通知 webpack to determine and flag (这个单词不知道是什么意思) chunks，这些 chunks 是其他 chunks 的子集，一旦更大的 chunk 已经被加载，是否需再加载这个 chunk。如果 mode 是 production，那么会默认为 true
```js
module.exports = {
  optimization: {
    flagIncludedChunks: true
  }
}
```

## optimization.occurrenceOrder

`boolean`

告诉 webpack 为了产生最小的初始化 bundle，应该如何安排 modules 顺序. production mode 会默认开启这个功能，其他场景都会设置为 false

```js
module.exports = {
  optimization: {
    occurrenceOrder: false
  }
}
```

## optimization.providedExports

`boolean`

告诉 webpack 当碰到 `export * from ...` 代码时，要弄清除 modules 具体 export 了那些内容，以便生成更高效的代码。默认是开启这个功能

## optimization.concatenateModules

`boolean`

告诉 webpack 从 module graph 中找出合适的 segments 以便可以安全地 concatenated into 单个 module. production mode 这个值是 true，其他场景都是 false

## optimization.splitChunks

`object`

这个配置项是用于代替 webpack 4 之前的 `CommonsChunkPlugin`.

默认 SplitChunkPlugin 只影响 on-demand (按需加载) chunks, webpack 会自动基于以下条件拆分 chunks：

+ 新的 chunk 可以被共享使用 或者 是 node_modules 的 module (也就是 node_modules 的 module 会被拆分成独立的 chunk，如果多个 chunk 中，有共同的代码，会进一步拆分出包含公共代码的 chunk)
+ 在 min + gz 之前，chunk 的大小超过 30kb (如果拆分出来的 chunk size 大于 30kb，那会进一步拆分 chunk)
+ 当按需加载 chunks 的最大并发请求数小于等于 6
+ 当加载初始页面的最大并发请求数小于等于4

为了满足后面这两个条件，必要的时候 chunk 的大小可以大于 30kb。即应该先满足并发请求数不会超过指定的数目的前提下，才会进一步拆分 chunk 以减小 chunk 大小

### splitChunks.automaticNameDelimiter
`string`
默认 webpack 是使用 origin 和 name of the chunk 来生成 chunk name (bir vendor~main.js); 这个配置项用于指定 chunk name 中的分隔符。这个一般也不需要配置

### splitChunks.automaticNameMaxLength
`number=109`
设置chunk name 所包含的最大字符数量。这个一般不需要配置

### splitChunks.chunks
`function(chunk) | string`
这个选项指定哪些 chunks 会被用于优化。

如果是指定 string，只能设置 all, async, initial 这三个值中的一个。默认是 aysnc，即只有 on-demand 的chunks才会被优化；initial 表示只有 entry point 所需的 chunks 会被优化；all 表示所有 chunks。建议设置 all，对所有 chunks 都优化。

使用 function 可以更加细致控制哪些 chunks 要被优化。
```js
module.exports = {
  splitChunks: {
    chunks (chunk) {
      return chunk.name !== 'my-excluded-chunk'; // 这边指定所有 chunk.name 不是 my-excluded-chunk 的 chunks 都会被优化
    }
  }
}
```

### splitChunks.maxAsyncRequests & splitChunks.maxInitialRequests
`number`

splitChunks.maxAsyncRequests 指定按需加载允许的最大并发请求数 (默认是6)
splitChunks.maxInitialRequests 指定 entry point 允许的最大的并发请求数 (默认是4)

一般不需要配置这两个

### splitChunks.minChunks
`number`
指定最少要多少个 chunks 都包含同一个 module 的情况，才需要进一步拆分 chunk。 一般设置为 2

```js
module.exports = {
  optimization: {
    minChunks: 2
  }
}
```

### splitChunks.minSize
`number`

一个 chunk 最小要多大(以 byte 为单位) 才会被拆分出来。即如果满足条件的代码要进行拆分，拆分的 chunk 要满足这个大小才会被拆分

### splitChunks.name
`boolean = true | function(module,chunks,cachedGroupKey) => string | string`

`splitChunks.cacheGroups.{cacheGroup}.name` 的指定规则跟这个是一样

设置为 true, webpack 会基于 chunks 和 cachedGroupKey 自动生成 chunk name
设置为 string 或者 会返回相同 string 的fn，这种情况会将共用的 modules 和 vendors 拆分到一个独立的 chunk。这会导致更大的初始化下载，导致页面加载变化

__注意__ production mode 强烈建议将值设置为 false，这样可以避免不必要的改变 names

```js
import _ from 'lodash';
console.log(_.join(['Hello', 'webpack'], ' '));
```
上面这个是一个 main.js 的部分内容，使用下面的配置

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          // cacheGroupKey here is 'common' as the key of the cacheGroup
          name(module, chunks, cacheGroupKey) {
            const moduleFileName = module.identifier().split('/').reduceRight(item => item); // 获取文件名称
            const allChunksNames = chunks.map(item => item.name).join('~');;
            return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`
          }
        },
        chunks: 'all'
      }
    }
  }
}
```

最终生成的 chunk name 是 commons-main-lodash.js.e7519d2bb8777058fa27.js

## splitChunks.automaticNamePrefix
`string = ''`
设置生成的 chunks 名称前缀，一般不需要设置

```js
module.exports = {
  optimization: {
    splitChunks: {
      automaticNamePrefix: 'general-prefix',
      cacheGroups: {
        react: {
          automaticNamePrefix: 'react-chunks-prefix'
        }
      }
    }
  }
}
```

### splitChunks.cacheGroups

Cache group 可以覆盖 splitChunks.* 的配置项，另外还可以指定 test, priority 和 reuseExistingChunk，这三个配置项只应用于 cache group level. 设置 false 值可以禁用任何 cache group 的默认配置。
```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false
      }
    }
  }
}
```

### splitChunks.cacheGroups.{cacheGroup}.priority
`number`

一个 module 可能会属于多个 cache groups. 高 priority 的 cache group 会优先被使用。默认 group 会设置为 负数，这样允许自定义的 groups 可以有更高优先级(默认 priority 是 0)

### splitChunks.cacheGroups.{cacheGroup}.reuseExistingChunk
`boolean``

如果当前 chunk 包含的 modules 已经从 main bundle 中拆分出去了，这个配置项可以重用已有的 chunk，而不是再生成一个新的 chunk。这个配置项会影响最终的 chunk name

### splitChunks.cacheGroups.{cacheGroup}.test
`function(module, chunk) => boolean | RegExp | string`

控制哪些 modules 会被这个 cache group 选用。如果没有设置这个，会选择所有 modules。

使用 fn，可以控制匹配 module resource path 或者 chunk names。如果一个 chunk name 被匹配，这个 chunk 里的所有 modules 都会被选择。
```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        svgGroup: {
          test(module, chunk) {
            const path = require('path');
            return module.resource && 
                module.resource.endsWith('.svg') &&
                module.resource.includes(`${path.sep}includes${path.sep}`)

          }
        },
        byModuleTypeGroup: {
          test(module, chunks) {
            return module.type === 'javascript/auto';
          }
        }
      }
    }
  }
}
```
### splitChunks.cacheGroups.{cacheGroup}.filename
`string | function(chunkData): string`

当且仅当是一个 initial chunk 时，这个配置项允许覆盖 filename，所有 output.filename 的 placeholders 都可以用在这边

### splitChunks.cacheGroups.{cacheGroup}.enforce
`boolean`

告知 webpack 忽略 splitChunk.minSize, splitChunk.minChunks, splitChunk.maxAsyncRequests and splitChunk.maxInitailRequests 这些配置项，始终给这个 cache group 创建 chunks

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          enforce: true
        }
      }
    }
  }
}
```





这个的配置信息要参考 [splitChunks](https://webpack.js.org/plugins/split-chunks-plugin/)

