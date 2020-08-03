# provider

Provider component 通常是包含 App 的 root component, 这样整颗 component tree 都可以访问到 redux store

## 使用示例
```javascript
const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <TodoApp />
  </Provider>,
  rootElement
)
```

Provider 接收一个 store prop, 这个 store 就是通过 redux 的 createStore() 创建而来。 TodoApp 得是一个通过 connect()(wrappedComponent) 创建的 container component。

Provider 还可以接收一个 context 参数, 这个场景比较少见，目前先不研究。

Provider 的使用很简单，就是放到 rootComponent 的最外面, 接收一个 store 的 props， 这样后面的 component (实际是 container component) 都能获取到 store.

## Provider pattern

这个是使用 react context api, 将 provider 和 consumer 应用到 Provider 和 container component, container component 没有显示获取 provider 的 store，是因为中间的 connect() 做了一些工作。具体参考 [context](../react/context.md)


