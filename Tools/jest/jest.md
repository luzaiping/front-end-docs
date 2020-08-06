jest
=======================

## 搭建

### 基本 jest 搭建

首先安装 jest，然后初始化 jest.config.js (这个是可选操作，建议创建配置文件进行管理)

```sh
jest --init
```

**上面在命令行中直接执行 jest，这要求 jest 是全局安装**

__建议__ 最好也安装下 @types/jest, 这样就会对应的代码提示功能。

### 集成 babel

由于 js/jsx 代码现在都是用 ES6+, 要让 jest 识别这些代码，就需要引入 jest-babel

```sh
npm i -D babel-jest
```

之后在 babel.config.js 确保已经配置了 preset

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env'
      // {
      //   modules: false,  // 注意 module 不可以为 false，否则会禁用 ES modules，导致无法识别 ES6 import / export; 最简单的就是不配置这个选项
      // }
    ],
    '@babel/preset-react'
  ]
}
```

### 集成 webpack

webpack 支持静态资源,比如 image、fonts、css；使用 jest 对页面(对于 SPA 对应的通常是组件)进行测试时，是无法识别到这些资源；由于这些资源对应测试结果并没影响，因此可以通过配置 *mock them out*,修改 jest.config.js 文件，配置 moduleNameMapper 选项：

```js
"moduleNameMapper": {
  "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
  "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
}
```

这边分别使用 fileMock.js 和 styleMock.js 对图片和css进行 mock。之后在根目录下创建 *__mocks__* 文件夹及 fileMock.js 和 styleMock.js 文件：

```js
// __mocks__/styleMock.js
module.exports = {};
```

```js
// __mocks__/fileMock.js
module.exports = 'test-file-stub';
```

Jest 也支持 css module，具体可以查看 [官方文档](https://jestjs.io/docs/en/webpack)

集成 webpack，通常还需要处理一种情形，即 webpack alias。处理思路跟 css/image 类似，也是配置 moduleNameMapper

```js
moduleNameMapper: {
  '@/(.*)$': '<rootDir>/client/spa/$1',
  '@pmall': '<rootDir>/client/spa/apps/pmall/'
}
```

**这边也特别注意 @，这个已经被 jest 内部使用，因此需要像上面那样配置，采用正则表达式分组模式写法**

## 集成 enzyme 和 react

首先安装 npm 包: enzyme, @types/enzyme, enzyme-adapter-react-16

之后添加 setup 文件来配置 adapter, 在 jest.config.js 中添加
```js
{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'] // 指明 setupFile 
}
```

同时在根目录下创建 jest.setup.js 文件，内容如下：

```js
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
```
