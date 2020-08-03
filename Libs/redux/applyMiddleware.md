# 说明

```javascript
  function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
      //
    }
  }
```

调用 applyMiddleware(...middlewares), 返回一个函数，这个函数叫 enhancer, 在调用 createStore() 时，通常会传递这个参数。

执行createStore()时，如果有enhancer，那么会先执行 enhancer(createStore)(reducers, preloadState)

applymiddleware函数其实就是一个 partical 函数, 这个 partical 函数会依次执行以下内容：

1. 调用 createStore(...args) 执行store的创建, 并得到创建后的store. 这边的 args 是 rootReducers 和 preloadState. 执行 createStore() 函数, 如果没有enhancer，那么就会真正创建一个 store，createStore()的细节，参考 createStore.md
1. 得到创建后的 store 后, 开始应用 middlewares. 首先对 middlwares 进行 map, 执行 middlewares 的第一层函数，该函数接收一个名称叫 middlewareAPI 的object类型参数，值为  
```javascript
let middlewareAPI = {
  state: store.getState,
  dispatch: (...args) => dispatch(...args)
}
```
这边的 dispatch 函数执行时会立即抛出一个 Error (这个是dispath的初始值, 后面链式完后 dispatch 会变成最终 dispatch, 因为 dispatch 被重新赋值了)，在链式完之前, 如果调用 dispatch, 就会抛异常，这也是这个初始值的意义所在.

3. 对 middlwares map 后得到一个新数组 chain, 该数组的元素是已经传递了 middleareAPI 的函数
1. 紧接着执行 compose(...chain)(store.dispatch), 执行这个后，就会得到类似 f(g(h(store.dispatch))) 的结果, 这个结果还是一个函数，接收最终的 action 作为参数. compose 对 chain 数组的元素是 按照从右到左的顺序进行 链式处理，即假设 chain = [f, g, h], 执行完后 compose(...chain) 得到一个函数是 (...args) => f(g(h(...args))). 然后再传递 store.dispatch 执行该函数， 也就是确定了每一个 middleware 的 next 参数。
1. 执行完 compose(...chain)(store.dispatch) 得到了最终的 dispatch, 然后将该 dispatch 和 初始 store 进行 合并得到最终的 store 并返回出去。

__注意:__

__1. 应用完 middleware 后的 dispatch 是增加的dispatch, 一旦执行 dispatch(action) 就会依次执行 middleware 的最里层方法__

__2. 最终返回 store 里的 dispatch 和 传给链式 middleware 的 dispatch 是一样__

