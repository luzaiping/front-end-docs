学习笔记
==================

## 基础类型

### boolean 类型

没什么特别，无法是在 变量 后面加上 `:boolean` 声明

```ts
let isDone: boolean = false;
```

### number 类型

没什么特别，无法是在 变量 后面加上 `:number` 声明

### string 类型

没什么特别，无法是在 变量 后面加上 `:string` 声明

### Symbol 类型

相比上面3种类型，这个比较特殊，不能在变量后面加上类型声明，否则类型会不对 (至于原因，暂时不清楚)

```ts
const sym = Symbol();
const sym2: Symbol = Symbol();

const o = {
  [sym]: 'sss',
  [sym2]: '3333' // Error, A computed property name must be of type 'string', 'number', 'symbol', or 'any'
}
```

### array 类型

数组类型声明有两种形式：`number[]` 和 `Array<number>`，后面这种其实就是泛型写法。

### enum 类型

enum 可以再细分成4种：

#### 数字 enum

```ts
enum DIRECTION {
  NORTH,
  SOUTH,
  EAST,
  WEST
}
let dir: DIRECTION = DIRECTION.NORTH
```

数字 enum 不要求对成员进行初始化，如果没有初始化，默认第一个的值为 0，后面的值依次加 1 (当然也可以进行初始化，后面的值如果没有初始化一样是依次加1)

这种 enum 有个特性，除了有 key 到 value 的映射关系，比如 DIRECTION.NORTH 其实值是等于 0，同时也有 value 到 key 的映射，比如 DIRECTION[0] 会得到 key 'NORTH'

#### 字符串 enum

这种 enum，要求必须对每个成员都进行初始化，并且值必须是字符串字面量，或另外一个字符串枚举成员进行初始化 (后面这种场景目前还不清楚怎么使用)。

同数字 enum 不同的是，这种 enum 不支持 value 到 key 的映射。

#### 异构 enum

这种类型的成员值是数字和字符串的混合：

```ts
enum DIRECTION {
  A,
  B = 'B',
  C = 0,
  D,
  E = 'E'
}
```

这种类型对于初始有要求，如果上一个成员值是字符串，那么下一个成员值必须初始化，比如上面的 C; 如果上一个成员值是数字，下一个可以不用显示初始化 (值就是上一个值 + 1)

实际应用中，应用尽量避免使用这种类型，因为定义成一组 enum，值应该保持一样类型。

#### 常量 enum

这种类型就是在定义前加上 const 关键字

```ts
const enum DIRECTOIN {
  NORTH,
  SOUTH,
  EAST,
  WEST
};
const dir: DIRECTION = DIRECTION.NORTH;
```

上面这段最终编译后，等于下面这段内容：

```js
"use strict";
var dir = 0 /* NORTH */;
```

这是因为常量 enum，会使用内联语法，不会为 Enum 类型编译生成任何 JS 代码。

### any 类型

在 TS 中，任何类型都可以被归为 any 类型，这让 any 类型成为了类型系统的顶级类型。可以赋值任何类型的值给 any 类型，也可以将 any 类型的值赋值给任何类型
```ts
let anyValue: any;

anyValue = 1;
anyValue = true;

let value1: unknown = anyValue;
let value2: any = anyValue;
let value3: number = anyValue;
let value4: boolean = anyValue;

// 对 any 做任何操作，ts 检查都会通过
anyValue.foo.bar; // OK
anyValue.trim(); // OK
anyValue(); // OK
new anyValue(); // OK
anyValue[0][1]; // OK
```
这导致 any 类型过于宽松，不利于类型检查。实际应用中应该尽量避免使用 any 类型

### unknown 类型

TS 3.0 引入 unknown，同 any 类型一样，任何类型值也可以赋值给 unknown 变量，但是 unknown 值只能赋值给 any 和 unknown 类型值。

```ts
let unknownValue: unknown;
let value5: unknown = unknownValue;
let value6: any = unknownValue;
let value7: number = unknownValue; // Type 'unknown' is not assignable to type 'number'.

// 对 unknown value 进行操作，都会报错
unknownValue.foo.bar; // Error
unknownValue.trim(); // Error
unknownValue(); // Error
new unknownValue(); // Error
unknownValue[0][1]; // Error
```

### Tuple 类型

这是一种特殊的数组，允许值是不同类型；在定义变量时就应该定义好类型

```ts
let tupleType: [string, number];
tupleType = ['1', 1];
tupleType = [0, 1]; // Type 'number' is not assignable to type 'string'.
```

在初始化值时，如果类型不匹配，ts 就会提示错误。

### void 类型

从某种程度上来讲， void 类型像是与 any 类型相反，它表示没有任何类型，当一个函数没有返回值时，通常会指定返回值类型是 void，这也是 void 最常用的场景

```ts
function test(): void {
  // not returned value
}
```

声明一个变量为 void 是没有什么作用，因为在 strict 模式下，它的值只能为 undefinied

```ts
let unuseable: void = undefined;
let a: void = null; // Type 'null' is not assignable to type 'void'.
```

### null 和 undefined 类型

这2个跟 JS 是一致，没什么特别

### never 类型

never 表示永不存在的值类型；比如 总是会抛出异常 或者 根本就不会有返回值的函数的返回值类型就可以用 never 表示

```ts
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop():never {
  while(true) {}
}
```

### object, Object 类型

object 类型是 2.2版本引入的新类型，用于表示非原始类型，看下面这个例子：

```ts
function create(o: object | null): any {}
Object.create({});
Object.create(() => {})
Object.create(null);
Object.create(2); // Argument of type '2' is not assigned to parameter of type 'object | null'
Object.create(undefined); // Argument of type 'undefined' is not assigned to parameter of type 'object | null'
```

由于 2 和 undefined 都属于原始类型，因此会匹配不上 object 类型

ts 的 Object 类型 跟 js 一样，表示对象类型，它由两个接口定义：Object 和 ObjectConstructor

+ Object 接口定义了 Object.prototype 对象的属性, 比如 toString(), hasOwnProperty()
+ ObjectConstructor 接口定义了 Object 对象的属性，比如 Object.create, Object.getPrototype

## 断言

### 类型断言

类型断言用于将某个变量的类型转换为更具体的类型, 这个有两种语法，一个是 <>，另外一个是 as

```ts
let someValue: any = 'this is a string';
let strLength: number = (someValue as string).length;
let strLength2: number = (<string>someValue).length; // 这个等同于上面那句
```

由于在 jsx 中，<> 有特别的语义，因此建议使用 as 语法。

### 非空断言

后缀表达式符 `!` 可以用于断言操作对象是非 null 和 非 undefined。比如 x! 会从 x 值域中排除 null 和 undefined

```ts
function test(value: string | null | undefined) {
  let maybeStr: string = value; // Error
  let mustBeStr: string = value!; // OK, 明确去除 null 和 undefined
}
```

除了变量赋值外，也可以用在函数调用(如果将函数当成变量，其实跟上面是一样情形)，看下面例子：

```ts
type NumGenerator = () => number; // 这个写法挺特别，直接将类型写在函数体

function myFun(numGenerator: NumGenerator | null) {
  let num: number = numGenerator(); // Error, numGenerator 可能是 null
  let num2: number = numGenerator!(); // OK
}
```

### 确定赋值断言

有些变量在为赋值前就被使用，ts 会检查将这种情形，并给出错误提示

```ts
let x: number;
init();
console.log(x * 2); // Error, variable 'x' is used before being assigned.

function init() {
    x = 10;
}
```

上面这个例子会提示错误，解决这个错误的办法是在变量 x 声明时确定赋值断言

```ts
let x!:number;
```

改成上面这样即可。

确定赋值断言和非空断言很类似，都是在变量后面加上 `!`, 区别是赋值断言是应用在变量声明时，而非空断言是应用在变量被使用时。

确定赋值断言只对 let 声明的变量有效，const 声明的变量必须先初始化，因此不会出现使用前还没赋值的情形。