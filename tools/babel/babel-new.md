# babel

babel 是一个工具链，主要用于将 ES2105+ 的代码转换成向后兼容的 javascript 代码，让这些代码可以在当前或者老旧的浏览器或其他环境可以直接使用。babel 的主要工作包括：

+ transform syntax (通过 plugins 或 presets )
+ polyfill features that are missing in your target environment.( 通过 babel-polyfill)
+ source code transformations (codemonds  这个暂时不清楚是什么)

## 基础工具/包

### babel-cli

这是一个 cli 的 npm 包，允许直接在 cli 上编译代码。使用前需要先安装:

```shell
npm install --save-dev babel-cli
```

安装后之后就可以在 cli 上面运行：

```shell
babel my-file.js
```

__注意:__ cli 上面是直接输入 babel, 而不是 babel-cli。上面这句会将编译结果直接输出到 console

如果要将结果输出到指定文件, 可以通过 --out-file 或者 -o

```shell
babel my-file.js --out-file compiled.js
babel my-file.js -o compiled.js
```

也可以将整个文件夹编译输出到另外一个文件夹，通过 --out-dir 或 -d

```shell
babel src -out-dir lib
babel src -d lib
```

#### 在项目里运行 babel-cli

在项目里运行 babel 就是在 package.json 里添加对应的 npm-scripts

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "build": "babel src -d lib"
  },
  "dependencies": {
    "babel-cli": "^6.0.0"
  }
}
```

配置完 scripts 后，就可以在 cli 上面运行 npm run build 执行 script。这是常见的使用场景，像上面直接在 cli 上运行 babel 不常见。

### babel-register

babel-register 是运行 babel 的另一种常见方法, 这种方法通过 require files 来运行 babel

不过这种方式不要在 production 上面使用，production 上面要预先编译好代码才行，而 babel-register 是边运行边编译。这个适合 build scripts 或者 运行其他只在本地运行的事情。

使用前，需要先安装 babel-register:

```shell
npm install --save-dev babel-register
```

然后在项目里创建一个 register.js, 包含如下内容：

```javascript
require('babel-register');
require('index.js');
```

这个会将 babel-register 注册到 Node 的 module system，然后编译每一个通过 require 引入的文件。外部只需要执行 node register.js 即可。

__注意:__ 不可以将 babel 注册到要编译的文件里面：

```javascript
require('babel-register');
console.log('hello world!')
```
像上面这个，假如是在同一个文件里，那么 console.log('hello world') 是不会被编译。

### babel-node

如果只是在 node cli 上运行一些代码，使用 bable-node 是将 babel 和 node 集成到一起的最简单方法, 它是 node cli de 替代品.

和 babel-registry 一样， babel-node 也不要直接用在生产环境上，应该实现编译好代码然后再部署到生产环境上面；适合 build scripts 或者 运行其他只在本地运行的事情。

```json
{
  "scripts": {
    "script-name": "babel-node script.js"
  }
}
```

### babel-core

如果因为某些原因，需要使用 Babel 编写代码，那可以使用 babel-core 这个 package，先安装：

```shell
npm install babel-core
```

然后在代码中使用 babel-core 的 API

```javascript
let babel = require('babel-core');
babel.transform('code()', options); // 将 string 的 js 代码进行编译
babel.transformFile('filename.js', options, function(error, result) { // 异步编译指定文件
  result; // { code, map, ast }
});
babel.transformFileSync('filename.js', options) // 同步编译指定文件
babel.transformFromAst(ast, code, options); // 直接从 AST 编译代码
```

## 配置 babel

直接运行 babel 只是将源代码 拷贝生成到另外一份，并不会对代码本身进行编译；需要安装 plugins 或者 presets (一组 plugins) 来告诉 babel 要怎么处理代码。

### .babelrc

添加一个 .babelrc 文件，在文件里面配置 plugins 和 presets

```
{
  "presets": [],
  "plugins": []
}
```

__注意：__ 也可以在运行 babel 的时候传递 options 来指定, 不过使用 .babelrc 是最常用的做法。

常见 presets 和 plugins 有：

+ babel-preset-es2015   编译 ES2015 语法
+ babel-preset-react    编译 react/jsx 语法
+ babel-preset-stage-x  编译 某个stage 的语法

## 执行 babel 生成的代码

通过 babel 将代码编译好了之后，还没完事。

大多数新的语法都能使用 babel 进行编译处理， 但是不包括新的APIS, 比如 Array.from

要解决 APIS 编译的问题，就得引入 babel-polyfill。 

babel-polyfill 使用 core-js 这个包作为它的主要 polyfill, 另外使用一个可定制化的 regenerator runtime 来让 generator 和 async function 可以工作：

```shell
npm install --save babel-polyfill
```

安装完后，在项目的根入口文件引用:

```javascript
import 'babel-polyfill'
```

__注意__ babel-polyfill 应该保存在 dependencies 里面，而不是 devDependencies

## bable-runtime

为了实现 ECMAScript 规范的细节, babel 会使用 helper 方法来保持生成代码的整洁。

这些 helper 方法通常都很长，而且在每一个编译的文件最顶部被引入进来。我们应该将这些代码抽取到一个 runtime 的文件里。通过使用 babel-plugin-transform-runtime 和 babel-runtime 来实现：

```shell
npm install --save-dev babel-plugin-transform-runtime
npm install --save babel-runtime
```

安装完后，在 .babelrc 文件里添加配置：

{
  "plugins": ["transform-runtime"]
}

这样编译的后的代码是统一 import 'babel-runtime/helpers/***' 里的代码了