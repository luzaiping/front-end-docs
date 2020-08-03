# observer 

## 定义

定义对象之间的一对多依赖，当一个对象改变状态时，它的所有依赖者都会收到通知并自动更新。

## uml

## 适用场景

浏览器的事件监听

## 延伸：

## 实现

```javascript
let subject = (function() {
  let obervers = {type: []} // 这个也可以换成 object = {type: []} 这样可以实现对各种类型的管理；而不是只是单一type的管理
  register(type, observer) {}
  unRegister(observer) {}
  notify(type) {}
})()
let observer = { update() {} }
let observer2 = { update() {} }
let observer3 = { update() {} }
let observer4 = { update() {} }

subject.register(type, observer)
subject.register(type, observer2)
subject.register(type, observer3)
subject.register(type2, observer4)

notify(type) // observer observer2 observer3 都会收到通知
notify(type2) // observer4 会收到通知
```