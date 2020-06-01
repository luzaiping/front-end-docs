Babel 插件
==================================

## API
Babel 实际上是一组模块的集合。本节我们将探索一些主要的模块，解释它们是做什么的以及如何使用它们。

### babylon

babylon 是 babel 的解析器。负责将代码转换为 ast。通过 `npm install --save babylon` 安装

```js
import * as babylon from "babylon";

const code = `function square(n) {
  return n * n;
}`;

babylon(code); // 解析 code，得到 ast
```

### babel-traverse

babel-traverse 维护整棵树的状态，并且负责替换、移除和添加节点。

```sh
npm install --save babel-traverse
```

```js
import * as babylon from "babylon";
import traverse from "babel-traverse";

const code = `function square(n) {
  return n * n;
}`;
const ast = babylon(code);

traverse(ast, {
  enter(path) {
    if (path.node.type === "Identifier" && path.node.name === "n") {
      path.node.name = "x";
    }
  }
})
```

### babel-types

babel-types 是一个用于 AST 节点的 Lodash 式工具库，它包含了构造、验证以及转换 AST 节点的方法。

```sh
npm install --save babel-types
```

```js
import traverse from "babel-traverse";
import * as t from "babel-types";

traverse(ast, {
  enter(path) {
    // 这个等同于上面例子的判断条件
    if (t.isIdentifier(path.node, { name: 'n'})) {
      path.node.name = 'x'
    }
  }
})
```

### babel-generator

babel-generator 是 babel 的代码生成器， 它读取AST并将其转换为代码和源码映射(sourcemaps)。

```sh
npm install --save babel-generator
```

```js
import * as babylon from "babylon";
import generate from "babel-generator";

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);
generate(ast, {}, code);
```

## 编写一个插件

先从一个接收了当前 babel 对象作为参数的 function 开始。

```js
export default function(babel) {
  // plugin content
}
```

由于经常需要用到 babel.types (即 babel-types), 因此可以用 destructuring 处理参数

```js
export default function({ types }) {
  // plugin content
}
```

函数应该返回一个对象，其中 visitor 属性是这个插件的主要访问者。

```js
export default function({ types }) {
  return {
    visitor: {
      // visitor contents
    }
  }
}
```

visistor 每个函数接收2个参数： path 和 state

```js
export default function({ types }) {
  return {
    visitor: {
      Identifier(path, state) {},
      BinaryExpression(path, state) {}
      // other node visitor
    }
  }
}
```

写一个对 `foo === bar;` 进行转换的 plugin

```js
export default function({ types }) {
  return {
    visitor: {
      BinaryExpression(path) {
        if (path.node.operator !== '===') return;

        path.node.left = types.identifier('sebmck'); // 将左边节点换成是 sebmck
        path.node.right = types.identifier('dork'); // 右边节点换成 dork
      }
    }
  }
}
```

最终就会将 `foo === bar` 转换成  `sebmck === dork`