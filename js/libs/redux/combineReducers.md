# 说明

  combineReducers(obj), 接收一个object类型的参数，最终返回一个 reducer function.

  obj的key对应state的split state，key对应的value用于处理该 split state 的状态变更

```javascript
  let rootReducer = combineReducers({
    todo,
    filter
  })
```
上面的代码等同于下面的代码

```javascript
  function reducer(state, action) {
    return {
      todo: todo(state.todo, action),
      filter: filter(state.filter, actoin)
    }
  }
```