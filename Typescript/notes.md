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

### object, Object 类型, {}

#### object 类型

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

#### Object 类型

ts 的 Object 类型 跟 js 一样，表示对象类型，它由两个接口定义：Object 和 ObjectConstructor

+ Object 接口定义了 Object.prototype 对象的属性, 比如 toString(), hasOwnProperty()
+ ObjectConstructor 接口定义了 Object 对象的属性，比如 Object.create, Object.getPrototype

#### {}

ts 可以定义对象值(这个跟JS是一样)， 也可以定义对象类型 

```ts
type O = {
  name: string,
  age: number
}
```

这种用法类似于 interface，通常也建议直接使用 interface 来定义。

## 断言

### 类型断言

类型断言用于将某个变量的类型转换为更具体的类型, 这个有两种语法: 一个是 <>，另外一个是 as

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

## 类型守卫

类型守卫的主要目的是尝试检测属性、方法或原型，以确定如何处理值。

### in 关键字

这个类似于 JS in 关键字，用于判断某个属性是否在指定的对象里。

### typeof 关键字

类似于 js typeof。

typeof 类型保护只支持两种形式：`typeof v === 'typename'` 和 `typeof v !== 'typename'`, typename 必须是 'number', 'string', 'boolean' 或 'symbol'。如果 typename 是其他字符串值，比如 'object', ts 不会把那些表达式识别为类型保护。(这句话没有理解是什么意思，需要再加深理解)

### instanceof 关键字

类似于 js instanceof, 用于检测原型链

### 自定义类型保护的类型谓词

```ts
function isNumber(x: any): x is number {
    return typeof x === 'number';
}

function isString(x: any): x is string {
    return typeof x === 'string';
}
```

对于这种用法，目前还不熟悉，需要再加深理解。

## 联合类型和类型别名

### 联合类型

联合类型就是将多个类型合起来表示一个新的类型，多个类型用 `|` 隔开。

```ts
let val: string | number; // val 可以是 string 或者 number 类型
```

上面的 val 类型就是 string 和 number 联合类型。这也是比较常见的用法。

还有一种方法，是直接指定值：

```ts
let value: 1 | '1' = 1;
```
上面这个例子，联合类型用 `1|'1'` 表示，这个首先指明了 value 的类型可以是 number 或者 string，其次也指定了 value 的值只能是 1 或者 '1'。这种定义方式不光约束了变量的类型，也约束了变量的取值。这种也成为 `字面量类型`

### 类型别名

当联合类型是多个类型的联合，每次都写出多个类型，会显得麻烦，这时可以使用类型别名，即将联合类型定义成一个新的类型变量，语法上就是使用 type 定义

```ts
type Message = string | string[];
let greet = (message: Message) => {};
```

这边的 Message 就是类型别名。

### 可辨识联合

这种包含3个特性

+ 可辨识：指的是用于联合的每个类型，都包含一个可以唯一区分其他类型的属性
+ 联合类型：定义的类型是一个联合类型
+ 类型守卫：通过类型守卫实现类型识别

这个用法的使用场景，目前还不清楚。需要通过实践加深理解。

## 交叉类型

将多个类型合并为一个类型。通过 `&` 运算符将多种类型叠加到一起成为一种新类型。

### 同名基础类型属性的合并

两个类型都包含名称相同的属性，如果相同属性的类型不同，并且类型是基础类型，那么最终得到的类型会是 never。

### 同名非基础类型属性的合并

在混入多个类型时，若存在相同的成员，且成员类型为非基本数据类型，那么是可以成功合并。

## 函数

TS 函数与 JS 函数主要有以下差别：
1. ts 函数还有类型 (这边指的是参数和返回值，而不是函数类型的概念)，js 没有类型说法
1. 参数可以是必填和可选, js 参数都是可选
1. ts 是有函数类型的概念, 而 js 没有
1. ts 函数可以重载, js 没有这种概念

### 函数类型

```ts
let IdGenerator: (chars: string, nums: number) => string;

function createUserId(name: string, id: number): string {
    return name + id;
}

IdGenerator = createUserId;
```

上面的 `(chars: string, nums: number) => string` 就是函数类型，定义了一个函数的格式, 包含参数个数、类型、返回值类型

### 可选参数 和 默认参数

```ts
function createUserId(name: string = 'Felix', id: number, age?: number) {
  let result = name + id;
  if (age) result += age;
  return result;
}
```

+ 可选参数是在参数之后加上 `?`, 需要注意的是可选参数要放在必选参数的后面，另外可选参数不可以有默认值
+ ts 的默认参数跟 js 类似，在参数后面指定默认值就行
+ 拥有默认值的参数，调用时可以不提供实参 或者提供 对应类型，或者 undefined，但不可以提供类型不匹配的值

### this 参数

可以为 函数 提供 this 作为参数列表里的第一个参数，如果没有指定，默认 this 的类型是 any, 这会导致函数不太调用方式时，this 可能不是期望的值

```ts
interface Card {
  suit: string;
  card: number;
}
interface Desk {
  suits: string[],
  createCardPicker(this: Desk): () => Card
}
const desk: Desk = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  createCardPicker(this: Desk) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);
      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    }
  }
};
```

### 函数重载

函数重载是使用相同名称，不同参数类型或者类型来创建多个方法的一种能力 (类似于 java overload)

当 TS 编译器处理函数重载时，会查找重载列表，尝试使用第一个重载定义。如果匹配的话就使用；因此在定义重载的时候，一定要把最精确的定义放在最前面。

这个的用途目前不熟，后面通过实践加深理解。

## 接口

ts 里的 接口，除了具备 oop 的特性 (抽象某个类的行为，即 implements )，还具有定义类型结构(shape)的作用，后面这个功能主要用途是定义某个实例的结构。

接口包含以下几种特性：

+ 正常的结构定义
+ 可选属性
+ 只读属性
+ 函数类型 (Function Types)
+ 索引类型 (Indexable Types)

### 正常的结构定义

这个没啥特别，就是正常定义 属性名称 和 类型；使用的时候需要注意的是，只要被传入的参数包含了定义接口所需的所有属性即可

```ts
interface LabeledValue {
    label: string;
}
function printLabel(labeledValue: LabeledValue) {
    console.log(labeledValue.label);
}
const myObj = { size: 0, label: 'something' };
printLabel(myObj);
```

上面这个例子，labeledValue 这个参数的类型是 LabeledValue ，这个接口只定义了 label 属性，实际传入的参数 myObj 包含了 label 并且类型也是 string，因此可以正常使用；哪怕 myObj 多了接口没有定义的 size 属性也没关系。

### 可选属性

```ts
interface SquareConfig {
  color?: string;
  name?: string;
}
```

在属性名称后面加上 `?`，即表示该属性是可选 (这个语法类似于函数的可选参数)

__注意__ 使用可选属性，如果匹配的值是 object literal (字面量), 而传入了接口不包含的属性，ts 是会报错。这个要特别注意。解决办法可以参考[官方文档](https://www.typescriptlang.org/docs/handbook/interfaces.html#readonly-properties)

### index signatures / Indexable Types (可索引类型)

这个语法是用于定义满足这个接口的对象，可以使用 number 或者 string 访问属性值，看个例子

```ts
interface NumberDictionary {
  [index: string]: number;
  length: number;
}

const dictionary: NumberDictionary = {
  pageNo: 10,
  pageSize: 1,
  length: 3
};
```

上面这个例子的 `[index: string]: number` 就是 Indexable Types, 下面解释下对应的语法:
+ index 没什么特别意义，可以换成其他任何名称
+ index 后面的 string，表示索引值的类型，比如例子中 dictionary['pageNo'] 中的 pageNo 就是由这个类型指定；不过使用 dictionary[0] 也不会报错，那是因为 0 会被转换成 '0'，然后再被索引
+ 右边的 number 用于指定索引之后的值类型，比如 dictionary['pageNo'] 应该是 number 类型，如果例子里将 pageNo 初始为 '10' 就会报错

这个类型有几个特别需要注意的事项：

#### 如果同时存在 number 和 string 类型索引，要求 number 索引之后值必须是 string 索引之后值的子类

```ts
interface NumberDictionary {
  [index: string]: number;
  [x: number]: string; // ERROR  Numeric index type 'string' is not assignable to string index type 'number'.
}
```

## 高级类型 (Advanced Types)

### Index Types

这是 TS 独有的语法，看个例子：

```ts
function plock<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][]{
  return propertyNames.map(n => o[n]);
}

interface Car {
  manufacturer: string;
  model: string;
  year: number
}

let taxi: Car = {
  manufacturer: 'Toyota',
  model: 'Camry',
  year: 2014
};

let makeAndModel: string[] = pluck(taxi, ['manufacturer', 'model']);
```

这个涉及两个概念：

#### index type query operator

`keyof T` 叫做 index type query operator. 对于任何类型 T，`keyof T` 是类型 T 当前所有公共属性的联合类型。

```ts
let carProps: keyof Car; // 这个等同于  let carProps: 'manufacturer' | 'model' | 'year'
```
这个例子的 `keyof Car` 等同于 `'manufacturer' | 'model' | 'year'`; 不过有点需要注意的是，`keyof Car` 是会随着 Car 属性变更而实时变更。

#### indexed access operator

```ts
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}
```

`T[K]` 就是 indexed access operator。 `T[K]` 反映表达式语法，这意味着 `taxi['manufacturer']` 有着类型 `Car['manufacturer']`，也就是 `string`(在最上面例子中)。一旦返回 `T[K]` 结果，编译器会自动初始化真实类型。比如上面的 getProperty 会跟进请求的属性而返回的 `T[K]` 也可能不同

```ts
let manufacturer: string = getProperty(taxi, "manufacturer");
let year: number = getProperty(taxi, "year");
let unknown = getProperty(taxi, "unknown"); // Argument of type '"unknown"' is not assignable to parameter of type '"manufacturer" | "model" | "year"'.
```

### Index Types and Index signatures

```ts
interface Dictionary<T> {
  [key: string]: T;
}

let keys: keyof Dictionary<number>; // 这边 keyof Dictionary<number> 就等同于 string | number
let value: Dictionary<number>['foo']; // value 应该是 number 类型
```

## Utility Types

### Partical<Type>

构造一个新的类型，新类型包含 旧类型 的所有属性，并且将所有属性变成了 optional。

```ts
interface Todo {
  title: string;
  description: string;
}

let newType: Partial<Todo> = {
  title: 'som', // 这个也变成可选了
  description: 'dddd', // 这个是可选
  news: 'ddd' // Type '{ title: string; description: string; news: string; }' is not assignable to type 'Partial<Todo>'.
};

// 相当于是这样：
type Partical<Todo> = {
  title?: string;
  description?: string;
}
```

### Readonly<Type>

构造一个新的类型，新类型包含旧类型的所有属性，并且将所有属性设置为 readonly

```ts
// 等同于是下面的等式
type Readonly<Todo> = {
  readonly title: string;
  readonly description: string;
}
```

```ts
// Object.freeze 可以用下面的函数来表示
function freeze<Type>(obj: Type): Readonly<Type>;
```

### Record<Keys, Type>

构造一个新的类型，新类型包含 Keys 的所有属性，每个属性的类型是 Type, 看一个例子：

```ts
inteface PageInfo {
  title: string;
}

type Page = 'home' | 'contact' | 'about';

const nav: Record<Page, PageInfo> = {
  home: { title: 'home' },
  contact: { title: 'contact' },
  about: { title: 'about' }
}
```

### Pick<Type, Keys>

构造一个新的类型，从 Type 中选择一组属性 Keys (即新类型，应该包含 Keys 指定的属性，并且这组属性是属于 Type; 相当于新类型是 Type 的子集)

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
const todo: TodoPreview = {
  title: 'clean room',,
  completed: true
};
```

### Omit<Type, Keys>

这个跟 `Pick<Type, Keys>` 刚好是相反， Pick 是选择 Keys 中的属性，而 Omit 是选择不包含在 Keys 的属性，上面那个例子改用 Omit 编写：

```ts
type TodoPreview = Omit<Todo, "description">;
```

### Exclude<Type, ExcludedUnion>

构造一个新类型，新类型将所有 ExcludedUnion 成员从 Type 中移除, 类似于 `Omit<Type, Keys>`; 这个主要是去除 union type 的 member

```ts
type type0 = Exclude<"a" | "b" | "c", "a">;
  // = type type0 = "b" | "c";
```
### Extract<Type, Union>

构造一个新类型，通过抽取 Type 的联合类型，该联合类型是可以赋值给 Union, 说白了就是抽取 Type 和 Union 的共同部分组成一个新的类型

```ts
type T0 = Extract<"a" | "b" | "c", "a" | "f">
```

### NonNullable<Type>

构造一个新类型，该类型是将 Type 中的 null 和 undefined 去除

```ts
type T0 = NonNullable<string | number | undefined | null>;

const t: T0 = 1;
const t2: T0 = 'ssss';
```

### Parameters<Type>

从一个函数参数的所有类型中构造一个元组

```ts
type T0 = Parameters<() => string>; // type T0 = [], 因为函数参数是空，所以类型自然也是空
type T1 = Parameters<(s: string) => void>; // type T1 = [s: string]
type T2 = Parameters<<T>(arg: T) => T>; // type T2 = [arg: unknown]
```
### Required<Type>

这个跟 `Partical<Type>` 是相反，将所有属性都变成必须