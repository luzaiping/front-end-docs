# event

react 里处理事件，只需要将 callback 作为 jsx 的 attribute 即可。但是如果需要在 callback 里使用this 关键字，就需要对 callback 进行绑定，否则 this 就是 undefined。

进行事件绑定有3种方法：

1. 在 constructor 里调用 bind 进行绑定
1. 使用新的 public class fields 语法将 callback 在 class 里定义成 arrow function
1. 在 jsx 的属性里采用 arrow function 形式

分别举例子进行说明

```javascript
class Todo extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {}

  render() {
    return(
      <h1 onClick={this.handleClick}> click on me. </h1>
    )
  }
}
```

这种方式的缺点是无法在 onClick 的时候传递其他参数给 callback

第二种方式

```javascript
class Todo extends React.Component {
  handleClick = (e) => {}
}
```

将 callback 定义成 箭头函数。 新语法，需要加相应的东东进行转化

第三种方式
```javascript
render() {
  return(
    <h1 onClick={(e) => { this.handleClick(e) }> click on me. </h1>
  )
}
```
callback 写成 arrow function，然后在 body 里调用 callback, 因为 arrow function 里的this 会采用最近的 lexical environment。这种方式可以直接传入其他参数给 callback。但是缺点也很明显，那就是每次该component进行render的时候，都会创建一个新的 onClick callback，如果这个 callback 传给 child component，那么 child 会触发 re-rendering， 因为 props 发生变更了。

所以尽量采用 第一种 或者 第二种方式，第三种缺点比较明显，会产生性能问题。
