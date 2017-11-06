# Babel

## CLI

使用前，需先安装 babel-cli ( npm install --save-dev babel-cli )，建议是 __local__ 安装模式，而不是 __global__ 安装模式。安装成功后，就可以运行 babel命令；babel cli 有两种命令，一个是 babel，一个是 babel-node

### babel 命令

该命令负责将 ES5 以上的语法，compile 成 ES5 的语法，编译后的文件才能被当前host支持(浏览器或者Node)，编辑后可通过 node xxx.js 直接执行.

该命令包含一些常用的命令选项(options)，比如:

1. --out-file 或 -o 可以跟上编辑后的文件名称

1. --watch 或 -w 表示检测文件的变化，并实时编辑

这个命令只做一件事，就是将指定的文件或文件夹ES6语法编辑成ES5的语法，然后就没有然后了；至于编译后的文件或文件夹要怎么用，跟这个命令就无关了。

### babel-node 命令

babel-node 支持 node REPL，可以在 REPL 里执行运行ES6的代码。当然也支持babel命令的功能，编译某个文件，__同时__ 还会执行编辑后的文件；所以babel-node 其实是 bable 和 node 两个命令的结合。

这个命令一般会用到 package.json 的 script 里，作为执行某个 script 命令的一部分

## babel-register

这是另外一种使用Babel的方式。babel-register 是一个 require hook. 该 require hook 会将自身 bind 到 node's require，然后就能自动编辑后续所有通过 require 引入的文件( .es6, .es, .jsx, .js 后缀的文件)

### 使用方法

1. 安装 babel-register

    ```shell
        npm install babel-register --save-dev
    ````

1. require babel-register

    ```javascript
        require('babel-register')
    ```

通常在文件头 require，这样后续的 require 文件 都可以被 Babel 编译

__注意：__ polyfill 需要另外导入，如果需要的话

## 运行 ES6 modules

node 6 还不支持 ES6的modules，如果要运行这样的js文件，需要做如下的配置和操作：

1. install babel-core, babel-cli 和 babel-preset-es2015
1. 配置.babelrc，添加 { "presets": ["es2015"] } 配置
1. babel-node modules.js