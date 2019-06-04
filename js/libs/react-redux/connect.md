# connect

这是一个函数, 函数签名如下

```javascript
connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
```
这个函数执行后返回一个高价组件(HOC), hoc 再接收 wrappedComponent, 然后最终的 container component

这个函数是 react-redux 暴露出来的核心, 实际开发中基本都是跟这个函数挂钩, 接下来重点说明几个参数的用法和注意事项

## mapStateToProps(state, ownProps)

提供这个函数, 最终的wrappedComponent才会因为 redux store 的变更而触发 re-render, 也就说如果这个函数的返回值为 null 或者 undefined, 即使 redux store 发生变更，那么对应的 component 也不会 re-render, 即 UI 不会刷新最新内容。

这个函数只有两种情况会被执行：

1、redux store 发生变更
1、ownProps是可选，如果传递了 ownProps, 那么 ownProps 发生变化，也会再次执行这个函数. 处于性能考虑，除非特殊情况，一般都不要传这个参数

这个函数最终会返回一个 object (也可以是函数，这种情况另说), react-redux 会比较 前后两次返回的 Object, 从而判定是否需要触发 re-render：

+ react-redux 对 返回object 中每一个key对应的value 是采用 === 的比较方式, 只要有一个 key 对应的 value 前后发生变化了，就会触发 re-render
+ key 对应的 value，通常是来自 redux store, 所以如果 store 发生变更，不要直接修改 store, 否则前后两次的引用是一样，就不会重新触发 re-render (这是没有re-render常见的一种错误)
+ key 的 value 会因为某些数据转换，导致返回新的引用，特别是 array 和 object 类型的值
  + 使用 array 的 filter(), map(), slice(), concat()
  + 使用 Object.assign
  + 使用 spread operator {...oldState, ...newState}

上面这个几个都会创建新的引用，从而导致前后两次比较结果是不同，引发不必要的re-render(多余的re-render), 从而产生不必要的性能问题。解决办法是使用 selecotr (redux-selector)

如果函数返回的是函数，那么最终会再此运行一次返回函数，将返回函数的返回值传给 connect()

这个函数应该尽可能的快，所以很多数据的工作可以放到 reducer 或者 component 的 render 里去做

## mapDispatchToProps(dispatch, ownProps)

这个的返回结果是作为 connect() 的第二个参数，如果没有传这个参数，那么 component 是可以访问到 this.props.dispatch, 然后直接触发特定的action, 当然这是不推荐的做法，因为component就得感知dispatch，不再是纯的component。这种只有在 component 及其 非 container component 的 child 都不需要触发 action 才会碰到。

实际应用中大部分都是会传这个参数值, 参数值包含了封装了 dispatch 的 actionCreator, component 及其 children 就可以在不感知 dispatch 的情况触发 action

这个函数的返回值有两种形式，一种是 obejct， 一种是函数

## 返回值是 object 

后面内容还是直接看 [官方文档](https://react-redux.js.org/using-react-redux/connect-mapdispatch), 因为官方文档是在是太详细了 ^_^