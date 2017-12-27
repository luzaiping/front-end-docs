# Immutability 在 Redux 和 React-Redux 中的应用

首先来看一个例子，这个例子是 Redux reducer 函数的写法，功能很简单，就是接收 Redux action 请求，根据 action 参数，对state进行管理：

```javascript
export default createReducer(initList, {
    [actionConstants.GET_TODOS.SUCCESS](state, action) {
        let { todos = [] } = action
        state.todos = todos  // 第4行
        return state
    },
})
```

对Redux稍微有些熟悉的同学应该都能看出来，这个例子有个很明显的问题，在第4行这边，我们直接修改了原有state的值。Redux基本原则第三条说到reducers应该是pure function，显然这个例子已经违法了这个原则。那么这么做到底会有什么问题呢？我们先来讲解下理论知识，最后再回来回答这个问题。

## 浅比较 和 深比较

在开始讲解Redux 和 React-Redux 这2个类库的相关内容前，先来说明下对象比较的两种方式：浅比较(Shallow equality checking) 和 深比较 (Deep equality checking)。

### 浅比较

浅比较也叫引用比较(reference equality)，这种比较方式就是判断2个变量是否引用同一个对象，即是否指向内存中的同一个地址。这种比较方式简单、高效。

### 深比较

相比于浅比较，深比较就比较复杂；这种方式要比较两个对象中每一个属性(property)对应的值是否相等，如果属性又是对象，需要递归的比较。从效率上来说，这种方式要比浅比较慢，尤其是对象结构有多层嵌套时，执行效率要差不少。

—就是因为执行效率上的明显差别，Redux 和 React-Redux 都是采用__浅比较__的方式来判断2个对象是否相等。

下面通过一个简单例子，说明下这2种比较方式的差异：

```javascript
let obj = { name: '张三', age: 18 }
let obj2 = { name: '张三', age: 18 }

obj === obj2 //  如果是深比较，比较结果就是true；如果是浅比较，结果就是false
```

## Redux 为什么要用 immutability

针对这个问题，我们反过来问，如果 Redux 不用 immutability 会有什么问题？不用的话，会产生2个对我们平时开发影响比较大的问题：

1. 如果使用Redux的时间穿梭功能；Redux 将每次状态的变更保存到数组里；要实现时间穿梭功能，对于 Redux 而言就是获取数组里的不同状态数据；如果不使用 immutability，每次状态变更修改的都是当前状态，最终的结果就是不同阶段的状态指向的都是同一份数据，自然就无法实现时间穿梭功能。

1. 如果使用 React-Redux 将 Redux 状态关联到 React Component，假如 Redux 状态没有被正确修改，那么 React-Redux 可能不会触发 React 组件的重新渲染。也就是我们修改了 Redux 的 state，但是 React 组件在UI上并没有刷新出来。这种情形不少初学者应该都遇到过。

## Immutability 在 Redux 中的应用

前面已经说过，Redux 是使用浅比较判断两个对象是否相等；要比较前后两次的 state 是否有变更，就得保证 state 的 immutability，即处理某个action请求，如果 state 需要变更，那么就基于当前 state 返回一个修改后的state，而不是直接修改当前 state；如果不需要变更，则直接返回当前 state。

### Redux 如何使用 浅比较

Redux 是在它的 combineReducers 函数里使用 浅比较。Redux state 的结构，官方建议是将整个 root state 拆分成多个相对独立的小state，每一个小state由各自的 reducer 函数负责管理。combineReducers 函数使得对state的这种管理方式变得容易，来看下 combineReducers 的例子：

```javascript
combineReducers({ todos: myTodosReducer, counter: myCounterReducer })
```

combineReducers 接受一个 object 对象，对象中的每一个 key 就是每一个 小state 的名称，value 是一个 reducer 函数，用于管理这个 小state。

现在结合 combineReducers 源码，看下 combineReducers 都做了什么，是如何使用浅比较：

![combineReducers 部分源码](./combineReducers.png)

1. 146行，Redux 对所有 key 组成的finalReducerKeys进行迭代，以上面那个例子为例，finalReducerKeys 就是 ['todos', 'counter']
1. 149行，根据当前迭代key，获取当前key对应的 小state，将 小state 存储到变量 previousStateForKey
1. 150行，将 previousStateForKey 和 action 作为参数，执行reducer函数，得到新的 小state，存储到 nextStateForKey 变量里
1. 155行，更新 nextStateForKey 到 nextState 里
1. 156行，使用__浅比较__判断 previousStateForKey 和 nextStateForKey 是否相等 (如果 hasChanged 是 true，就不再比较)，将比较结果存储到变量 hasChanged
1. 158行，所有key都迭代结束后，根据 hasChanged 的值，决定返回新状态(nextState)还是当前状态(state)

这边的 nextState 和 state 是整个root state，数据结构如下：

```javascript
{
    todos: array,
    counter: number
}
```

从源码中我们可以看出，只要有一个 小state 浅比较不相等，hasChanged 值就是true，最终就会返回新state。

研究完 Redux 源码后，现在回过头看下最开始那个例子，那个例子直接修改了当前 state，这样 combineReducers 在执行第156行，计算 hasChanged 就会得到不正确的结果，由于直接修改了state，所以在返回值上面并没有影响，因为nextState 和 state 是同一个对象(这个例子因为root state 比较简单，如果是复杂的结构并且一个action同时修改了多个 小state，那么情况会更加复杂)。不过这么做会使得时间穿梭功能不正常，因为返回的上一个状态是错误；另外一个影响发生在 React-Redux 的Smart Component，我们接着往下看。

### React-Redux 如何使用 浅比较

先看下基于 React-Redux 实现的 Smart Component：

```javascript
function mapStateToProps(state) {
    return {
        todos: state.todos
    }
}
```

React-Redux 使用浅比较来判断它所包装的 Component 是否需要 re-render, 判断的依据是：

1. 对 Redux 前后的 root state 进行浅比较，如果状态发生变更了，则执行下一条判断；如果没有发生变更，则不会触发 re-render;
1. 对 mapStateToProps 返回对象中每一个 key 对应的 value 进行浅比较，如果有一个 key 对应的 value 和 前一个状态相同 key 对应的 value 不一样，就执行 re-render

从这边可以看出，React-Redux 是依赖于 Redux 的 state，如果 Redux state 没有被正确更新，就有可能导致 React-Redux 所包装的 Component 没能正确在。还是最开始那个例子，我们直接修改了 Redux state，但是 combineReducers 计算后 hasChanged 值是 false，导致 React-Redux 在对 root state 进行浅比较时，就判定状态没有变更，因此组件也就不会 re-render.

### React-Redux 为什么是对 mapStateToProps 函数返回对象中的每一个属性值 进行浅比较

这是因为 mapStateToProps 每次都是返回一个新的对象，如果直接浅比较返回对象，就有可能出现不必要的 re-render，通过一个例子来说明：

```javascript
function mapStateToProps(state) {
    return {
        todos: state.todos
    }
}
```

假如 Redux State 的 count 发生变更了，而 todos 没有变更；根据 React-Redux 判断 re-render 的依据，因为 Redux root state 发生变更了，因此第一条判断是通过；这样就会执行第二条判断。如果第二条判断直接比较 mapStateToProps 的返回值，结果也会判定状态有变更，因此就会引起包装的component re-render。 而实际是这个 Smart Component 只关注 todos 的状态变更，只有todos发生变更了，才重新渲染组件，但是现在 count 的变更却引起了组件的重新渲染，从而导致不必要的性能开销。基于这个原因，__React-Redux 是对 mapStateToProps 函数返回对象中每一个 key 对应的 value 进行浅比较__。

## 几个例子分析

前面主要讲解一些理论知识，现在基于这些知识来分析下几个例子存在的问题。这些例子都是基于 Redux root state 是下面的结构：

```javascript
{
    todos: array,
    count: number
}
```

### 例子1

reducer函数：

```javascript
export default createReducer(initList, {
    [actionConstants.GET_TODOS.SUCCESS](state, action) {
        let { todos = [] } = action
        let newState = state  // 第4行
        newState.todos = todos // 第5行
        return { ...newState } // 第6行
    },
})
```

Smart Component：

```javascript
function mapStateToProps(state) {
    return {
        todos: state.todos
    }
}
```

这个例子跟最开始的那个例子有点类似，唯一区别是这边最后返回一个新对象，而最开始那个例子是直接返回修改后的state。那么这个例子有什么问题呢？

1. 第4行创建了newState变量，不过跟state是同样的引用；第5行虽然是修改 newState.todos，但其实也把state修改了；所以这个 reducer 已经不是 pure function，Redux state 已经不是 immutability；这样直接导致的结果就是时间穿梭功能会出问题；
1. 第6行通过ES6 的 spread operator 返回一个内容跟 newState 一样，引用不同的新对象
1. 因为 reducer 最终返回新对象，因此使用 React-Redux 的 Smart component 在判断是否需要 re-render 的第一个条件时一样会判定 Redux root state 有变更，所以会往下执行第二个判断条件，因为前后的state不是同一个对象，由 mapStateToProps 返回对象中的 todos 所指向的 state.todos 也就不一样，浅比较时会判断状态有变更，因此会执行包装组件的 re-render。

如果项目不实现时间穿梭功能，那么这个例子，看上去功能是正常。当然这样的写法是极力不推荐，Redux 官方对 state 的推荐用法是 state 应该是只读，任何状态的变更都应该通过 reducer 来实现，而且 reducer 应该是 pure function，即不能对 state 有任何直接修改。不光是 Redux，其他能引用到 state 的地方都不允许直接修改 state，比如 Smart Component。

### 例子2

对上面例子的reducer函数进行调整：

```javascript
export default createReducer(initList, {
    [actionConstants.GET_TODOS.SUCCESS](state, action) {
        let { todos = [] } = action
        let newState = todos.length > 0 ? { ...state, todos } : state  // 第4行
        return { ...newState } // 第5行
    },
})
```

这个例子，根据 todos 数组的大小得到 newState，第4行这边，从写法上没有任何问题，如果 todo.length 大于 0，返回的是一个新state，否则返回当前state；这个例子的问题出在第5行，不管第4行得到的 newState 是修改后的 state 还是原先 state，第5行都会再返回一个新state；这样 React-Redux 始终会判定需要对React component 进行 re-render。而对于 todos.length 不大于 0 的情形，我们的本意是state没有变更，React component 无需 re-render。

这个例子 Redux state 实现了 immutability，但是由于函数始终返回一个新的对象，导致不必要的 re-render，问题相比之前的例子有点隐蔽，需要留意。解决这个问题的办法很简单，去掉第5行，直接在第4行返回三元运算符的结果即可。

### 例子3

对第一个例子 Smart component 做下调整：

```javascript

const getVisibleTodos = todos => todos.filter(t => !t.completed)

function mapStateToProps(state) {
    return {
        visibleToDos: getVisibleTodos(state.todos)
    }
}
```

这个例子 mapStateToProps 返回对象里只有一个 visibleToDos属性，值是通过getVisibleTodos函数得到的数组。注意 getVisibleTodos 用的是 Array.prototype.filter 函数，这个函数是一个immutability 函数，每次执行都会返回新的数组。

这个例子如果是 Redux state 的 todos 发生变更，那么不会有任何问题。问题出在如果是只有 state 的 counter 发生变化，按照前面说的 re-render 判断依据，第一条显然满足，因此往下执行第二条判断，因为用了数组的filter函数，所以getVisibleTodos函数每次都会返回新数组，最终导致前后两次的visibleToDos在进行浅比较时，会判定不是同一对象，从而执行组件的re-render。即只是 counter 的变化，却导致了这个 Smart component 所包装的 component 重新渲染。

同第二个例子一样，这个问题也很隐蔽，不够解决办法相比会麻烦点，一种方案是借助 reselect。通过 reselect 的 createSelector 将 getVisibleTodos 函数包装起来，如果内存中没有所需的 visibleToDos，那么就会调用 getVisibleTodos 计算得到visibleToDos；如果已有visibleToDos，则直接返回visibleToDos，不会再执行 getVisibleTodos。这样如果 state.todos 没有变化，那么前后两次得到的 visibleToDos 就是同一个对象，也就不会触发 re-render。

## 总结

这篇文章主要讲解 Redux 和 React-Redux 这2个类库对于 immutability 的应用, 以及浅比较在其中扮演的重要角色。另外对于使用过程中可能碰到的问题进行分析。

对React组件会有影响主要有两个问题，一是状态的错误管理导致不触发re-render, 另外一种是应用了 immutability, 但是因为不恰当使用，导致不必要的 re-render。在实际开发过程中，牢记下面三点，就可以避免大部分的相关问题：

1. 永远不要直接去修改 Redux state
1. reducer 函数要嘛返回新state对象，要嘛返回当前state对象
1. 对于 mapStateToProps 函数，如果所关注的那部分 Redux state 没有变更，那么函数返回对象中每一个 key 对应的 value 也得不变