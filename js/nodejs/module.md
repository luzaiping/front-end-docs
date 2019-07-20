# node module 总结

## module wrapper

在 module code 被执行前，node 会将 code 封装在一个 wrapper function。最终形成类似下面的代码：

```javascript
(function(exports, require, module, __filename, __dirname) {
  // module code
})
```

通过这种方式，nodeJS 实现下面两个重要功能：

+ 将 module code 里面定义的 variable 作用域约束在 wrapper function里，从而不会影响全局作用域
+ 提供一些对 module code 特别有用的变量，并且这些变量看起来像是全局变量(其实是函数参数)
  - module 和 exports 对象用于到处 module values
  - __filename, __dirname 可以方便获取当前 module 的目录和完整文件名称

## 访问 main module

如果一个文件是通过 node 直接运行，那么 require.main 就会等于 module 对象。因此可以在 module code 里通过 require.main === module 判定当前module是否是 main module。

比如一个 foo.js 包含了上面的判断语句，那么 node foo.js 就会返回 true, node bar/foo.js 也是会返回 true; 如果是其他文件 require('./foo')，那么 foo.js 里的判断语句就会返回 false。

module 对象包含一个 filename property (module.filename 是等于 __filename), 因此可以通过 require.module.filename 来获取一个应用的 entry point。这在一个应用的任何 module 里得到的结果都是一样。

## require.resolve

当调用 require(path), 实际是通过执行 require.resolve() 来进行 module 查找，根据 path 的格式不同，resolve 过程也会不同；具体算法参考官方文档

## require.cache

module 在首次被加载之后就会被缓存起来，存放在 require.cache 对象里，之后每次调用同样的 require('foo') 都会得到第一次 resolve 的 Module 对象。

```javascript
require.cache = {
  '/usr/local/node/foo/index.js': <ModuleObject>,
  '/usr/local/node/foo/bar.js': <ModuleObject>,
  '/usr/local/node/foo/baz.js': <ModuleObject>,
}
```

require.cache 对象的内容大概像上面这样，其他 key 是 require module 的 filename，除了当前 module 会被加入 cache，module require 的其他 module 也会被加入到 require.cache； 不过 core modules 不会被加到 module 的 require.cache 对象里。

__注意__: 

1. require.cache 的 key 是基于 resolved filename，这个值跟 module 被调用或者执行的 位置有关，因此同样调用 require('foo') 不一定会得到一样的 Module object
1. 另外对于大小写不敏感的操作系统，require('foo') 和 require('FOO') 会 resolved 一样的 Module object，但是因为 key 不同，所以实际会分别 resolve 这2个 module

## core modules

nodejs 内置了一些编译成 binary 的 core modules。当 require 这些 modules，他们优先级更高，也就说 同名的自定义 module 会被忽略。

## 循环 require

当2个 module 互相 require 对方，这时候就会形成 循环 require。比如两个 module A，B，针对这种情况，node 会让 A 在 require B 之前把 exports 部分信息给到 B；B 得到部分 exports 信息后，完成自身 module 的执行，然后 exports 完整信息给 A，A 再最终执行完自身 module code。具体可以参考官方文档。 