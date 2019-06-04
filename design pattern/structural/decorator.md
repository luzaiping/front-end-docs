# decorator - 装饰器模式

## 定义

动态地将责任附加到对象上，想要扩展功能，装饰者提供了比继承更有弹性的替代方案。

装饰者可以在被装饰者的行为之前或者之后加上自己的行为，甚至将被装饰者的行为取代。(AOP)

## uml

## 适用场景

一些 AOP 就是通过装饰者模式来实现

ES7 自身的 decorator 原生支持

## 延伸：

开闭原则： 类应该对扩展开发，对修改关闭

目标： 允许在不修改现有代码的情况下，就可增加新的功能。

缺点： 引入新的抽象层次，增加代码的复杂度。

## 实现

```javascript
Class component {
  cost() {

  }
}
Class decorator {
  constructor(com) {
    this.com = comp; // 设置要装饰的对象
  }

  cost() { // 对 comp 的 cost 进行增强
    //  do something
    this.com.cost()
    // do something
  }

  selfMethod() { // decorator 自有方法

  }
}
```
