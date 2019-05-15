# 说明

```javascript
  function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
      //
    }
  }
```

调用 applyMiddleware(...middlewares), 返回一个函数，这个函数叫 enhancer, 在调用createStore()时，通常会传递这个参数。

执行createStore()时，如果有enhancer，那么会先执行 enhancer(createStore)(reducers, preloadState)

applymiddleware函数其实就是一个 partical 函数, 这个 partical 函数会依次执行以下内容：

1. 调用 createStore(...args) 执行store的创建, 并得到创建后的store. 这边的 args 是 rootReducers 和 preloadState. 执行 createStore() 函数, 如果没有enhancer，那么就会真正创建一个 store，createStore()的细节，参考 createStore.md
1.
1.

