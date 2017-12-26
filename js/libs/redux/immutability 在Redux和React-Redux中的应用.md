# immutability 在 Redux 和 React-Redux 中的应用

首先来看一个例子，这个例子是 Redux reducer 函数的写法，功能很简单，就是接收 Redux action 请求，根据 action 参数，对state进行管理：

```javascript
export default createReducer(initList, {
    [actionConstants.GET_LIST.SUCCESS](state, action) {
        let { items = [] } = action
        state.items = items  // 第4行
        return state
    },
})
```


## 浅比较 和 深比较

## immutability 在 Redux 中的应用

### Redux 为什么要用 immutability

### Redux 如何使用 immutability

### Redux 错误使用例子

## immutability 在 React-Redux 中的应用

### React-Redux 为什么要用 immutability

### React-Redux 如何使用 immutability

### React-Redux 错误使用例子

## 使用 immutability 说明