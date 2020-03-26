types
=====================

## js 已有的基本类型

+ undefined
+ null
+ boolean
+ number
+ string
+ object
+ symbol - 这个在 ts 中比较少用

## 新增的基本类型

+ Tuple - 元素数量是固定，并且类型也是事先确认
+ Enum - number|string
+ Any - powerful to existing codes.
+ Void - 通常用以函数返回值, 比如没有返回值的函数就是指定 Void. 对于 void 变量, 可以设置 undefined or null 给它.
+ Never - 表示永远都不会发生的指. never 是其他任何类型的子类型，因此可以将它赋值给其他任何类型。 但是反过来不行，除非 never 赋值给 never.
+ Array - 用于表示数组，可以有两种表示方式: Array<T> 或者 T[]

## type assertions

用于告诉 compiler, 你更加确认某个值的类型是什么, type assertions 有两种表示：

+ `<>` 尖括号的形式
+ as-syntax

```ts
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length; // 这边使用 尖括号 表示
let strLength: number = (someValue as string).length; // 这边使用  as 表示
```

这两种表示形式是等同，即大部分场景都是可以替换使用。但是在 jsx 中，只能用 as 表示法。

## type guard

### type predicates

使用 `parameterName is` Type 表示法，其中 parameterName 必须跟函数参数名一致

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

### 使用 in operator

使用 `n in x` 表示法, 其中 n 是 string literal or string literal type, x 是 union type.

```ts
function move(pet: Fish | Bird) {
  if ('swim' in Fish) {
    return pet.swim();
  } else {
    return pet.fly();
  }
}
```

### typeof type guards

two forms for `typeof` type guards

+ typeof value === 'typename'
+ typeof value !== 'typename'

`typename` 必须是 `number`, `string`, `boolean`, `symbol`

```ts
function paddingLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  if (typeof padding === 'string') {
    return padding + value;
  }
  throw new Error(`Expected string or number, but got '${padding}'`);
}
```

### instanceof type guards


### Nullable types

默认 ts checker 会允许 null 和 undefined 可以赋值给任何类型。

如果使用 `--strictNullChecks` flag, 当声明一个变量时, 这个变量就不会自动包含 null 和 undefined 这两种类型, 必须通过 union type 显示指定

```ts
let s = 'foo';
s = null; // error, 'null' is not assignable to 'string'
let sn: string | null = 'bar';
sn = null; // ok
sn = undefined; // error, 'undefined' is not assignable to 'string | null'
```

### optional parameters and properties

使用 `--strictNullChecks`, an optional parameters automatically add `| undefined`

```ts
function f(x: number, y?: number) {
  return x + (y || 0);
}

f(1, 2)
f(1)
f(1, undefined)
f(1, null); // error, 'null' is not assignable to 'number | undefined'
```

### type guards and type assertions

使用 `identifier!` 去除 null 和 undefined 值

```ts
function broken(name: string | null): string {
  function postfix(epithet: string) {
    return name.chatAt(0) + '. the ' + epithet; // error, 'name' is possibly null.
  }
  name = name || 'Bob';
  return postfix('great');
}

function fixed(name: string | null): string {
  function postfix(epithet: string) {
    return name!.chatAt(0) + '. the' + epithet; // 使用了 identifier! 消除了 null 和 undefined 的情形
  }
  name = name || 'Bob';
  return postfix('great');
}
```

### type aliases

type aliases 给一个 type 创建一个新的名称. aliases 不会创建新的 type - 只是创建一个新的 name 指向特定的 type.

### interface vs type aliases

- interface 会创建一个在各个地方都可以用的新 name
- use interface over aliases type

### string liternal types

### number liternal types

### Discriminated unions

combine singleton types, union types, type guards, and type aliases to build advanced pattern called discriminated unions, also known as tagged unions or algebraic data types.

```ts
interface Square {
  kind: 'square'; // set type as string literal type.
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle; // using type aliases and union type

function area(s: Shape): number {
  switch (s.kind) {
    case 'square':
      return s.size * s.size;
    case 'rectangle':
      return s.width * s.height;
    case 'circle':
      return Math.PI * s.radius ** 2;
  }
}

```

### Exhaustiveness checking

```ts
function assertNever(x: never): never {
  throw new Error('Unexpected object:' + x);
}

function area(s: Shape) {
  switch (s.kind) {
    case "square":
      return s.size * s.size;
    case "rectangle":
      return s.height * s.width;
    case "circle":
      return Math.PI * s.radius ** 2;
    default:
      return assertNever(s); // error here if there are missing cases
  }
}
```
