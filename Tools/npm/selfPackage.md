发布 package 的说明
===================

要发布 package 代码要分两部分：

+ 一份是源代码，要存放到 git 仓库，并推送到公共的地方，比如 github
+ 一份是 package 代码，也就是被使用的代码，通常包含 lib, dist, es, README 这些内容，也就是 npm install 后存放在 node_module 的 package 内容。 一般是推送到 npm 仓库，也可以是公司的私有仓库。

## 源代码部分 (提交到 github 的内容)

源代码部分跟开发一个应用类似，通常包含如下内容：

+ src 文件夹，用于存放源代码
+ test 文件夹，存放对应的测试代码，建议提供
+ README.md 描述关于这个 package 的安装，使用 等
+ LICENSE.md 一般就是 MIT 版本的内容
+ package.json
+ .gitignore
+ 其他开发 src test 所需要的配件文件，比如 webpack, eslint, babel

### 发布版本的考虑

因为是作为公共包发不出去，因此要考虑使用场景。使用场景通常包括 Nodejs，浏览器， ES6：

+ nodejs 环境，就得发布符合 commonjs 的版本
+ 浏览器 环境，只有发布 UMD 版本，浏览器环境才可以直接使用
+ ES6+ 环境，就得发布 ES module 版本

一般来说尽量都满足这些使用场景，下面以 tiny package 为例说明要如何用一份代码，生成多个不同版本：

+ commonjs 版本： 这个比较简单，通过 babel 将 src 编译成 ES5 代码，一般是存放在 lib 文件夹, 在 package.json 的 scripts 里添加如下 script：

  > "build:commonjs": "cross-env BABEL_ENV=commonjs babel src --out-dir lib"

+ ES 版本: 跟 commonjs 类似，也是通过 babel 来完成

  > "build:es": "cross-env BABEL_ENV=es babel src --out-dir es",

+ umd 版本：这个需要借助 webpack 或者 其他类似打包工具，将整个 src 打包成一个 bundle 文件，通常需要打 dev 和 production 两个版本

  > "build:umd": "cross-env BABEL_ENV=commonjs NODE_ENV=development webpack",
  > "build:umd:min": "cross-env BABEL_ENV=commonjs NODE_ENV=production webpack"

除了生成对应的版本文件外，还需要指定 main 和 module 这两个 filed； main 一般指向 commonjs 版本的入口文件； module 指向 ES 版本的入口文件：

```json
{
  "main": "lib/index.js",
  "module": "es/index.js",
}
```

上面的 main 指向了 lib/index.js，其他 lib 文件夹是我们通过 build:commonjs 这个 script 将 src 编译生成。module 就是 ES版本的文件夹。

通过上面这些配置，就完成了一份 src 符合多个应用场景的版本。

### gitignore

同一般的应用一样，一些只是开发过程中生成的内容，就不要提交到 git 里，通常需要将下面这些内容排除出去：

* node_modules
* coverage
* *.log
* lib
* dist
* es

__注意__ lib, dist, es 这三个文件夹，是不应该提交到 git 仓库，因为他们是通过编译或者打包生成的内容，其他人 clone 源码后，是可以自己 build。但是如果是作为 package 发布到 npm 仓库，这3个文件夹就是必须的内容。

## npm package 部分 (提交到 npm 仓库的内容)

这个将开发好后的 package 发布到 npm 仓库，让其他可以直接 install 使用，因此就需要把 lib， dist， es 这3个文件夹直接提交上去。提交之前配置 package.json 内容

### package 基础信息

首先需要设置 package 的一些基础信息：

```json
{
  "name": "@lemhion1908/tiny",
  "version": "0.1.2",
  "license": "MIT",
  "description": "Tiny utils of js.",
  "repository": "github:luzaiping/tiny",
  "bugs": "https://github.com/luzaiping/tiny/issues",
  "homepage": "https://github.com/luzaiping/tiny",
  "keywords": [
    "js",
    "utils",
    "pure-js"
  ],
  "author": "Zaiping Lu <lemhion1908@gmail.com>"
}
```

这些是一个 package 的基础信息，有3个 field 是跟 github 有关，因此需要将源码先推送到 github 上才能设置。

### files field

要指定哪些内容会包含在 package 里，需要通过 files 这个 filed 指定：

```json
{
  "files": [
    "lib",
    "es",
    "dist"
    "src"
  ]
}
```

其中 src 是可选，根据个人喜好决定要不要包含在内。除了 files 指定的内容会被包含，还有些内容会默认被包含在内：

+ package.json
+ README
+ CHANGES / CHANGELOG / HISTORY
+ LICENSE / LICENCE
+ NOTICE
+ main field 定义的文件

### README.md

这个文件是其他人了解这个 package 的最主要入口，通常应该包含如下内容：

+ Why you made the package
+ How to install it
+ A short example
+ Describe the API
+ In a subsection, explain how to contribute (your git workflow, how to install, run, test, build …)
+ Add some license

### Travis CI (集成测试工具，类似 Jenkins)

Test and Deploy Your Code with Confidence。

Easily sync your GitHub projects with Travis CI and you’ll be testing your code in minutes!

添加对应的 .travis.yml 文件。

使用方法参考官方文档。


### 最佳实践

看下例子：

```json
"scripts": {
  "prepare": "npm run clean && npm run lint && npm run test && npm run build",
  "lint": "eslint --fix **/*.{js,jsx}",
  "test": "jest",
  "clean": "rimraf lib dist es",
  "build": "npm run build:commonjs && npm run build:es && npm run build:umd && npm run build:umd:min",
  "build:commonjs": "cross-env BABEL_ENV=commonjs babel src --out-dir lib",
  "build:es": "cross-env BABEL_ENV=es babel src --out-dir es",
  "build:umd": "cross-env BABEL_ENV=commonjs NODE_ENV=development webpack",
  "build:umd:min": "cross-env BABEL_ENV=commonjs NODE_ENV=production webpack"
}
```

重点在 prepare 这个 scrpit， 这个 script 在 npm install 和 npm publish 这两个 script 执行前都会执行。因此可以将一些基本工作放到这个 script 里来完成。

比如这个例子，会先 run clean，将已有 文件夹 进行删除。然后运行 lint 进行代码校验；再 运行 test 进行单元测试；最后再重新生成 要发布的内容。这些步骤对应 npm publish 是必须的操作；对于 npm install 到不是必须，不过有这会更好，因为事先将内容生成出来，方便其他人了解这个 package。
