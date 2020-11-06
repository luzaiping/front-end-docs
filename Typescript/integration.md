react & typescript & webpack & babel & eslint & prettier & redux & jest & enzyme & less
====================================================================

### 集成 react / typescript / webpack

首先参考 [官文文档](https://www.typescriptlang.org/docs/handbook/react-&-webpack.html), 安装下面 npm 包

+ webpack webpack-cli - webpack
+ react react-dom - react
+ @types/react @types/react-dom - react declaration file
+ typescript ts-loader source-map-loader - typescript 以及 集成 webpack 所需的 loader

其他参考文档：
[React with Typescript and Webpack](https://www.pluralsight.com/guides/react-typescript-webpack)

### 集成 eslint

安装相关 npm 包： yarn add eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev

+ @typescript-eslint/parser: The parser that will allow ESLint to lint TypeScript code
+ @typescript-eslint/eslint-plugin: A plugin that contains a bunch of ESLint rules that are TypeScript specific

安装之后，添加 .eslintrc.js 文件，指定 

```js
{
  parser: '@typescript-eslint/parser', // 指定 eslint parser
  extends:  [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ]
}
```

这样就集成了 eslint 和 typescript，此时使用 require 的 js 文件就会报错 `Require statement not part of import statement.eslint(@typescript-eslint/no-var-requires)`。通常是 webpack.config.js, 可以添加 .eslintignore 文件进行过滤

### 集成 eslint 和 webpack

安装 eslint-loader, 添加 eslint-loader 配置

```js
{
  enforce: 'pre',
  test: /\.(j|t)sx?$/,
  exclude: /node_modules/,
  loader: 'eslint-loader',
  options: {
    emitError: true,
    emitWarning: true,
    failOnError: true,
    failOnWarning: true
  }
}
```
这样 webpack 启动的时候也会校验 eslint, 这个配置应该只加在 webpack.dev.js 里

### 集成 prettier

安装 prettier, eslint-config-prettier, eslint-plugin-prettier, 添加 以下配置

```js
{
   extends:  [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended'
  ]
}
```

### 集成 css/less

在 typescript 中应用 css/less, 跟在 javascript 应用没有什么区别. 安装对应的 loader, 以及 less, 然后在 webpack 添加配置即可

```sh
yarn add -D style-loader css-loader less less-loader
```

```js
{
  test: /\.less$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
    {
      loader: 'less-loader'
    }
  ]
}
```

__注意__ 如果要用于 css modules, 需要引入 `typings-for-css-modules-loader`, 同时需要降级 css-loader 到 1.0.1 的版本。另外 webpack 启动时会多次 build，还有会生成对应的 css.d.ts 文件。综合考虑，如果不在 typescript 项目中应用 css modules.

### 集成 jest 和 enzyme

首先安装 npm 包：
+ jest, enzyme, @types/enzyme
+ ts-jest: 这个可以解决 typescript 无法识别 it 和 describe 等 jest globals

之后编写 *.spec.ts 文件，运行 yarn test. 会报无法识别 less 或者 css 文件，这个需要 jest 对 css/image 等 assets 进行 mock：

```js
moduleNameMapper: {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
    '<rootDir>/__mocks__/fileMock.js',
  '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js'
}
```

创建 jest.config.js, 添加上面的内容, 同时在根目录创建 `__mocks__` 文件夹，分别创建 `styleMock.js` 和 `fileMock.js`。具体内容可以参考[官方文档](https://jestjs.io/docs/en/webpack#handling-static-assets)

然后再次运行 test。还是会报错！这是因为 spec.ts 中使用了 enzyme 的方法(mount), 需要引入 adapter 才行, 安装对应的 npm 包：

+ enzyme-adapter-react-16

安装后运行 yarn test, 还是报错，这是因为 jest 需要 setup 文件来配置 adapter, 在 jest.config.js 中添加
```js
{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'] // 指明 setupFile 
}
```
同时创建 jest.setup.js 文件，内容如下：

```js
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
```

再运行 test，还是报错，这次报的是无法识别 import。这是因为 .js 文件没有对应的 transform 来处理，需要增加 babel 来处理，安装 babel 包

+ @babel/core, @babel/preset-env
+ babel-jest

jest.config.js 中增加如下配置：

```js
{
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // ts-jest 处理 typescript
    '^.+\\.jsx?$': 'babel-jest' // babel-jest 处理 js/jsx 
  },
}
```

同时创建 babel.config.js

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
};
```
通过这一串的配置后，终于可以运行 yarn test


### 错误解决

问题： `Can't resolve 'object-assign' in 'xxx\node_modules\react\cjs'`
原因： webpack 无法识别 .js 和 .jsx 文件
修复： 在 webpack.config.js 添加 `{ resolve: extensions: ['.ts', '.tsx', ".js", ".jsx"] }`


问题：eslint `import/no-unresolved`
修复：在 .eslintrc.js 添加
```js
settings: {
  "import/resolver": {
    "node": {
      "extensions": [".js", ".jsx", ".ts", ".tsx"]
    }
  }
}
```
