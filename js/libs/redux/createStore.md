# 说明

```javascript
function createStore(reducer, preloadedState, enhancer){}
```

函数执行内容：

1. 首先对参数进行校验, 包括多个enhancer的异常处理; 第二个参数是function的情形; enhancer不是function的异常处理
1. 如果enhancer存在并且是一个function, 就直接执行 return enhancer(createStore)(reducer, preloadedState), 将控制交给 enhancer 函数
1. enhancer执行的时候又会先执行 createStore(reducer, preloadedState), 再次将控制执行交给createStore, 这时createStore不包含enhancer, 就会执行store的创建
1. 开始store的创建, 首先执行 dispatch(actionTypes.INIT), 也就是先dispatch一个初始的action
1. dispatch函数会先校验action的格式,没有问题后执行 reducer(currentState, action), 这边的reducer通常就是 combineReducer(obj) 的返回值(一个函数)，该函数内部依次调用各个 split reducer，从而实现 state 初始状态的设置。
1. 调用dispatch,会将内部变量isDispatching设置为ture, 另外执行通过subscribe注册的 listeners; 首次执行 dispatch(actionTypes.INIT), listeners 是空数组。只有后面显式通过 subscribe 注册 listener, 再次调用 dispatch, 已注册的 listeners 才会被调用
1. 执行完 dispatch(actionTypes.INIT), 返回创建好的 store, store 是一个 object, 包含如下内容：

```javascript
let store = {
  dispatch,
  subscribe,
  getState,
  replaceReducer,
  [$$observable]: observable
}
```
1. 创建完初始 store 后, 接着执行 enhancer(createStore)(reducer, preloadedState) 后面的内容, enhancer 会应用 middleware 对 store 的 dispatch 进行 chain 式封装，最后返回新的 store；这个新 store 相比初始 store 就是增强了 dispatch。之后只要是执行 dispatch(action), 都会进行 chain 式dispatch


接下来依次说明 store 各个属性的内容：

+ dispatch(action): 分发特定的 action, 执行到这个函数的 action 必须是一个 object 类型； 至于其他的 action 类型，比如 promise, function , iterate 等, 就得交给 middleware 进行处理;  如果没有对应 middleware 处理，最终执行到这个 函数 就会报错。 dispatch 内部其实就是调用 rootReducer(currentState, action), 然后再执行注册的 listeners
+ getState(): 返回内部变量 currentState. currentState 的初始值是 preloadedState, 在调用 dispatch() 执行 rootReducer(currentState, action) 之后, 将新 state assign 给 currentState
+ subscribe(listener): 将 listener 加入内部变量 nextListeners. nextListeners 初始值等于 currentListeners 也就是 []。执行 subscribe(listener) 后修改 nextListeners 数组。这个函数会返回一个 unsubscribe 函数, 调用 unsubscibe 函数, 会将对应 subscribe 的函数从 nextListeners 移除掉. 在执行 dispatch 函数里, 会将 nextListeners 赋值给 currentListeners. 也就是内部有2个 listeners, nextListeners 保存最新的 listener, currentListeners 保存最近一次调用 dispatch 时的 nextListeners. 当调用完 dispatch() 后, 这2个 listeners 是一样. 调用  subscribe 和 unsubscribe 之后，再次调用 dispatch 之前 的这个时间里, 2个 listeners 是不一样
+ replaceReducer(nextReducer): 首先将 nextReducer 赋值给内部变量 currentReducer. 然后执行 dispatch({ type: ActionTypes.REPLACE }). 因为 currentReducer 已经修改, 执行 dispatch 会重置整颗 state tree. 这个方法一般用不到.
+ [$$observable]: 对应内部的 observable 函数, 这个目前不清楚有什么用