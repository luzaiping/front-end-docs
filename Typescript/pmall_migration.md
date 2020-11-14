pmall 迁移记录
=====================

## 加入 ts 到 build pipeline

### typescript 和 babel

这2个都可以用来编译代码。之前 ts 转换 js，有 ts-loader 和 awesome-typescript-loader 方案，但是都不推荐了，因为需要将 ts 先转换为 js，再由 babel 将 js 转换成 低版本的 js，修改代码后，整个编译过程会变慢。

目前推荐的做法是使用 babel 7 + @babel/preset-typescript；编译工作都由 babel 来处理，typescript 只做类型检测工作，

@babel/preset-typescript和@babel/preset-react类似，是将特殊的语法转换为JS。但是有点区别的是，@babel/preset-typescript是直接移除TypeScript，转为JS，这使得它的编译速度飞快。

并且只需要管理 Babel 一个编译器就行了。而类型检测则使用 ESLint + @typescript-eslint 来完成。

这种方式对 ts 有4个影响：
+ 不能使用 namespace，不过这不是问题，因为本身就不推荐使用 namespace，这是旧的语法，应该首选 modules
+ 类型断言不能使用 `<>` 的形式，而是要用 as，这个也不是问题
+ 不能使用 const enum，这个开发时要注意
+ 不支持遗留的 import 和 export 语法：import foo = require(...) 和 export = foo, 这也不是问题，不推荐这样的写法

### 安装 dependencies

+ ts 相关： typescript, ts-loader, source-map-loader (可选，目前测试并不需要用到，只需要 webpack 配置 devtools 就行)
+ react 相关： @types/react, @types/react-dom, @types/react-redux, @types/react-router-dom
+ babel 相关： @babel/preset-typescript (其他 babel preset 和 plugin，cli-service 已经安装)

### 增加 babel 配置

```js
module.exports = {
  presets: [
    '@babel/preset-typescript',
  ]
};
```
主要是增加 @babel/preset-typescript, 这样 babel 就能处理 ts 文件

### 添加 ts 配置文件

```sh
tsc --init
```

运行上面命令会生成默认的 tsconfig.json，配置内容如下：

```json
{
  "compilerOptions": {
    "outDir": "./dist/",
    "sourceMap": true,
    // "moduleResolution": "Node",
    "noImplicitAny": true,
    "module": "es6", // specify module code generation
    "target": "esnext", // specify ECMAScript target version
    "jsx": "react", // use typescript to transpile jsx to js
    // "target": "es6", // compile to ES2015 (Babel will do the rest)
    // "jsx": "preserve", // enable JSX mode, but "preserve" tells TypeScript to not transform it (we'll use Babel)
    "strictNullChecks": true,
    "noEmit": true, // 不生成文件，只做类型检查
    "allowJs": true // allow a partial TypeScript and JavaScript codebase
  },
  "include": [
    "./client/"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "public",
    "**/*.spec.ts"
  ]
}
```

### 集成 eslint 和 typescript

安装两个依赖包： @typescript-eslint/parser @typescript-eslint/eslint-plugin

安装之后，修改 .eslintrc.js 文件，指定 

```js
{
  parser: '@typescript-eslint/parser', // 指定 eslint parser
  extends:  [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ]
}
```

这边配置完碰到下面的问题：
1. 'React' was used before it was defined.eslintno-use-before-define。目前是增加下面的 rules 来处理：
   + `'no-use-before-define': [0],`
   + `'@typescript-eslint/no-use-before-define': [1]`

### 验证

经过上面的调整后，修改一个文件以验证上面的过程是否正常：

修改 index.jsx -> index.tsx, 同时修改 react 和 reactDOM 的 import 方式，启动 dev:client 和 dev:server 试下效果。

## 转换 js(x) 成 ts(x)

这部分主要参考 [TypeScript-React-Conversion-Guide](https://github.com/Microsoft/TypeScript-React-Conversion-Guide#typescript-react-conversion-guide)

对于 pmall 项目，这是一个耗时比较久的过程。按推荐做法，整个项目的迁移分为3个步骤：

+ The minimum steps of converting one module to TypeScript. 即修改文件后缀，改成 ts(x)
+ Adding types in one module to get richer type checking.
+ Fully adopting TypeScript in the entire codebase.

### 修改文件后缀为 ts(x)

修改文件后缀后，ts 就会开始校验，以下是碰到的问题及处理方法

#### react 和 react-dom import 方式报错

这是因为 .d.ts 文件采用 commonjs module，也就是使用 modules.export 作为 default export，因此需要换成 `import * as React from "react"`

最新方法：后面看了资料，在 tsconfig.js 中配置 `"allowSyntheticDefaultImports": true`，这样就无需调整 import 方式。__推荐使用这种方法__

#### ts 不能识别 webpack resolve alias

这个问题需要在 tsconfig.json 中配置 `baseUrl` 和 `paths`，其中 `baseUrl` 指定 paths 的起始路径，paths 就是 alias 中定义的内容:

```json
"baseUrl": "./client", // 因为 paths 的起始路径都是 client，因此在这边指定，这样 paths 中就不用每个都再写一遍
"paths": {
  "@/*": ["spa/*"],
  "@h5/*": ["h5/*"],
  "@pmall/*": ["spa/apps/pmall/*"]
}
```
上面定义了三个 paths，对应 webpack alias 的配置是：

```js
alias: {
  '@': path.resolve(__dirname, './client/spa'),
  '@h5': path.resolve(__dirname, './client/h5'),
  '@pmall': path.resolve(__dirname, './client/spa/apps/pmall')
}
```

在 pmall 项目中配置完上面内容后，ts 是无法正确识别 paths 中 index 文件，必须显示在 import 文件后指明 index 才可以，比如 `import ErrorBoundary from '@/components/ErrorBoundary';` 要写成 `import ErrorBoundary from '@/components/ErrorBoundary/index';` 后面查了资料，是因为 ts.config 中 `module: "es6"`，需要将 es6 换成 commonjs，因为是 commonjs module 才会默认解析 index 文件，而 es module 不会。

配置完 paths 后带来的一个好处时，vscode 中在 import 某个文件时也可以自动提醒文件 path 了 (之前 webpack alias 形式的路径是不会有提醒功能)

### React 的写法调整

这部分内容可以查看 [这个cheatsheet](https://react-typescript-cheatsheet.netlify.app/docs/basic/setup);

#### 函数组件

有两种写法：

+ 正常的函数写法，要对 props 参数进行类型声明，同时要写上函数返回值类型
+ 使用 React.FunctionComponent 显示指定函数返回类型，推荐使用这种写法，可以用简写形式 React.FC，这种写法需要指定 propType 作为 React.FC 泛型

使用 React.FC, 无需再显示写出函数组件的返回值；不过函数不可以返回 false，因为 React.FC 只接受 `ReactElement<any, any> | null` 的类型，这样就需要对原先一些实现进行调整。(这个后面要看下有没有别的处理办法)


#### React.ReactElement / React.ReactNode / JSX.Element 

这三个的区别可以看下[这篇文章](https://stackoverflow.com/questions/58123398/when-to-use-jsx-element-vs-reactnode-vs-reactelement)

+ A ReactElement is an object with a type and props
+ A ReactNode is a ReactElement, a ReactFragment, a string, a number or an array of ReactNodes, or null, or undefined, or a boolean
+ JSX.Element is a ReactElement, with the generic type for props and type being any.

```ts
 <p> // <- ReactElement = JSX.Element
   <Custom> // <- ReactElement = JSX.Element
     {true && "test"} // <- ReactNode
  </Custom>
 </p>
```

简单点说：
+ render methods of class components return ReactNode
+ function components return ReactElement
+ children 的类型是 ReactNode

#### hooks

##### useState

`React.useState<S>` 如果是简单的值，可以不用指定 泛型，ts 会根据指定的初始值推断出类型。实际应用中通常初始值会是 null，这种情形就需要指定泛型，比如 `React.useState<number | null>`

##### useMemo

`React.useMemo<T>`，这边 T 的类型是 useMemo 写法中 factory function 的返回值。通常不需要使用 泛型，ts 会自动推动出类型。

### Redux 集成

#### 先对各个 slice state 进行 typing

slice state 只是简单的结构定义，不依赖其他内容，因此是 typing 的很好入口点。由于 store state 通常会存储 API response 内容，因此正常需要引入 response 类型

```ts
export interface ProductState {
  detail: ProductDetailResponse & { pictureIndex?: number };
  number: number;
  purchaseList: PurchaseProduct[];
  bannerTab: number;
}
```

#### 定义 slice state 所涉及的 action type 常量, 以及所有 Action 的联合

```ts
export const GET_PRODUCT_DETAIL = 'GET_PRODUCT_DETAIL';
export const SET_PURCHASE_NUMBER = 'SET_PURCHASE_NUMBER';
export const ADD_PURCHASE_LIST = 'ADD_PURCHASE_LIST';
export const SET_BANNER_TAB = 'SET_BANNER_TAB';
```

有了 action type 常量之后，就可以定义 action type 对象类型：

```ts
interface GetProductDetailAction {
  type: typeof GET_PRODUCT_DETAIL;
  payload: {
    data: ProductDetailResponse & { pictureIndex: number };
    switchSku: boolean;
  };
}

interface SetPurchaseNumberAction {
  type: typeof SET_PURCHASE_NUMBER;
  payload: { number: number };
}

interface AddPurchaseListAction {
  type: typeof ADD_PURCHASE_LIST;
  payload: ProductDetailResponse;
}

interface SetBannerTabAction {
  type: typeof SET_BANNER_TAB;
  payload: number;
}
```

有了各个具体 Action type 类型，就可以定义总的 Action

```ts
export type ProductAction =
  | GetProductDetailAction
  | SetPurchaseNumberAction
  | AddPurchaseListAction
  | SetBannerTabAction
```

ProductAction 是一个联合类型，该类型会在对应的 productReducer 中使用；也可能会在 ActionCreator 中使用

#### 对 ActionCreator 进行类型定义

ActionCreator 是一个函数，正常一个 Action type 对应一个 ActionCreator，该函数接收 payload 入参，返回一个总的 Action 对象

```ts
function addPurchaseList(purchasedProudct: PurchaseProduct): ProductAction {
  return {
    type: ADD_PURCHASE_LIST,
    payload: purchasedProudct
  };
}
```

由于实际应用中使用了 createAction 这个 util 方法来减少创建 ActionCreator 样本代码，因此上面的 ActionCreator 会简化成下面的代码：

```ts
const addPurchaseList = createAction(ADD_PURCHASE_LIST, PAYLOAD);
```

下面这种写法，在调用 addPurchaseList() 时无法对入参进行类型检查，不过 payload 的值最终传入 redcuer 时会被类型检查，因为 reducer 会检查 action 类型

#### 对 reducer 进行类型定义

首先需要对 initialState 进行类型定义

```ts
const initialState: ProductState = {
  ...
};
```

之后对 reducer 函数进行类型定义：

```ts
export default (state = initialState, action: ProductAction): ProductState => {
  switch(action.type) {
    case GET_PRODUCT_DETAIL: {
      ...
    }
    case SET_PURCHASE_NUMBER: {

    }
    case ADD_PURCHASE_LIST: {

    }
    default:
      return state;
  }
}
```

到了这步，一个 slice state 所涉及的 reducer，actionCreator，action type 都完成了类型定义。

#### 之后对整个 redux reducer 进行定义

这步必须在每一个 slice state 的 reducer 都定义完了之后才能实施

```ts
const rootReducer = combineReducers({
  ....
})

export type RootState = ReturnType<typeof rootReducer>;
```

这边 rootReducer 的代码还是不变，唯一要增加的是通过 ReturnType 得到 RootState。这个 RootState 需要在 react-redux 中使用，比如 useSelector 和 connector 组件

#### 对 createStore 进行类型定义

```ts
export default function configureStore(initialState = {}): Store {
  const composeFn = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancers = composeFn(applyMiddleware(thunk));
  return createStore(rootReducer, initialState, enhancers);
}
```

#### 对 Thunk middleware 进行类型定义

使用 Thunk, ActionCreator 的写法跟普通的 ActionCreator 不同，因此需要对 thunk 的 ActionCreator 进行类型定义：

```ts
export const getProductDetail = (payload: DetailPayload): AppThunk => async (
  dispatch
): Promise<void> => {
  ...
}
```

thunk ActionCreator 是一个高阶函数，需要分别对函数返回值进行类型定义，第一层函数的返回值是一个 AppThunk，第二层函数的返回值是一个 Promise (通常会在这边使用 async fn)。 AppThunk 是下面的定义：

```ts
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
```

其中 ThunkAction 是 'redux-thunk' 导出的类型定义，这边需要使用到 RootState，因此暂时也将 AppThunk 写在了 rootReducer 文件中。

### 对 react-redux 进行类型定义