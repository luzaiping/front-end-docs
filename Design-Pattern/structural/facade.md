# facade - 外观模式

## 定义
提供一个统一的接口，用来访问子系统中的一群接口。外观模式定义了一个高层接口，让子系统更容易适用

## uml

## 适用场景

+ 针对不同浏览器提供统一的事件注册接口 (jquery 的 $.on)

## 延伸

通过这个模式引出 最小知识原则： 只和你的密友谈话

## 实现

```javascript
let facade = (function() {
  // 内部的一群接口，每个接口可能需要引用多个其他对象
  function method1() {}
  function method2() {}
  function method3() {}
  function method4() {}
  function method5() {}

  return {
    doAll() { // 统一的对外方法
      method1();
      method2();
      method3();
      method4();
      method5();
    }
  }
})()
```