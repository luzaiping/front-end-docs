# Prototype

## 定义
todo

## UML
todo

## 适用场景
todo

## 实现

这个在 js 是原生支持, 通过 Object.create(prototype) 实现

```javascript
let proto = { name: '', age: 20 };
let obj = Object.create(proto)
```

也可以不用 Object.create, 通过 构造函数的 prototype 属性 实现：

```javascript
function create(proto) {
  function F() {}
  F.prototype = proto
  return new F()
}
let proto = { name: '', age: 20 }
let obj = create(proto)
```





