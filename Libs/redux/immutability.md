# Redux 和 React-Redux 中的Immutablility

这边的内容主要来自Redux官方文档的FAQS：[Redux FAQ: Immutable Data](http://redux.js.org/docs/faq/ImmutableData.html), 官方的这篇文章，非常详细地讲解了Immutability在 Redux 和 React-Redux 中的应用，以及使用中可能碰到的各种问题的解答，还有不使用Immutability会有什么问题。这边的记录基本引用官方文档，对其中的部分内容稍加一点关于个人理解的批注。

## Imutability 的好处

+ 给你的App带来显著的性能提升
+ 更容易编程和调试，因为可以更加自由地对数据进行修改，因为每次修改对会保证Immutability
+ 更容易实现一些复杂的功能，比如 时间旅行
+ 可以确保一些高成本的计算(比如DOM操作)只在绝对需要更新的时候才执行

## 为什么 Redux 要使用 Immutability

+ Redux 和 React-Redux 都是使用 引用比较( shadow equality checking) 的方式来判断两个对象是否相等(即 === 或 !==)
  + Redux 里的 combineReducers 会利用 引用比较 来判断由reducer function返回的state是否已经发生了变化
  + React-Redux connect 返回的 WrappedComponent 会比较前后的 root state，以及由 mapStateToProps 返回的对象中每一个值 是否相等，从而来决定是否需要对WrapperedComponent 进行，而这边的比较也是采用 引用比较
+ Immutability 这种数据管理方式能确保对数据的操作更加安全，即不用担心原先数据被修改
+ 时间旅行要求reducer function必须是 pure function with no side effects，这样就可以正确地在不同状态之间进行跳转

## 为什么 Redux 使用 引用比较 需要 Immutability

### Redux 是如何使用引用比较

Redux中是在combineReducers这个函数里用到了引用比较，通过这个函数返回一个新的copy root state 或者当前 root state

### combineReducers 是如何使用 引用比较

Redux通过combineReducers将一个大的state拆分成多个小的state，每个小的state各自管理自己的那部分数据，每个小的state就是一个reducer，先看下combineReducers的用法：

```javascript
combineReducers({
    todos: myTodosReducer,
    counter: myCounterReducer
})

function myTodosReducer(state, action) {}
```

这边todos 是root state 对象中的key, 通过 myTodosReducer 来管理state.todos这部分数据。counter作用跟todos一样。当dispatch 一个 action，myTodosReducer 和 myCounterReducer都会被执行，combineReducers 主要做下面3件事

1. 针对每一个key(上面的todos 和 counter)，创建一个对应的slice state
1. 把上面创建的 slice state 作为参数传给对应的 对应的reducer function 并 执行 function
1. 如果function需要对slice state进行修改，那么返回一个新的slice state，如果不需要则返回 当前 slice state

当每一个reducer都被执行完后，combineReducers 会分别比较 current slice state 和 new slice state，这边用到的就是 引用比较，如果有任何的 slice state 发生了变化，那么内部的 __hasChanged__ 就会是true，那么最终返回的 root state，就是由新的 slice state 组成，否则返回原先的 root state

### React-Redux 是如何利用 引用比较

React-Redux 利用 引用比较 来判断 wrappedComponent 是否需要。React-Redux 会假定 wrappedComponent 是 pure component。基于这个假定，React-Redux会利用 引用比较 来判断前后的 root state 是否一样(这边的root state就是Redux 中的state，包含所有slice state)，以及每次由 mapStateToProps 返回的 object中，object中的每一个 value 是否发生变化，如果没有发生变化，那么就不会执

### 为什么 React-Redux 是对 mapStateToProps 返回object中的每一个value进行 引用比较

每次调用 mapStateToProps 都会返回一个新object，React-Redux并不是比较前后两次的object是否一样，而是比较object中的每一个value；如果只是比较 mapStateToProps 返回的object，那么每次比较结果都会是true，因为前后两次对象不一样，那么就会导致每次action，component都会执行re-render；所以比较的是返回对象中的每一个value

### React-Redux 是如何利用 引用比较 来决定一个组件是否需要 re-render

React-Redux 会分两个步骤来做这件事

1. 当 React-Redux’s connect 被调用，React-Redux 会基于它内部保存的 root state object 和 传进来的 root state object 进行 引用比较；如果两个对象引用一样，那么就不需要re-render，如果不一样，那么就会执行第二个比较（正常dispatch action，root state 都会发生变化，很少会碰到不改变的情况）
1. 这时候就会调用 mapStateToProps 返回一个新的 object，迭代这个 新object 中的每一个值，同 旧Object 中对应的值 进行引用比较，如果有一个不一样，那么就需要re-render，如果都一样，那么就不用

看一个例子

``` javascript
function mapStateToProps(state) {
  return {
    todos: state.todos, // prop value
    visibleTodos: getVisibleTodos(state) // selector
  }
}
export default connect(mapStateToProps)(TodoApp)
```

这个例子，只要 state.todos 和 getVisibleTodos(state) 同 之前 object 中的 引用分别一样，那么就不需要re-render

再看一个修改版的例子

``` javascript
function mapStateToProps(state) {
  return {
    // todos always references a newly-created object
    todos: {
      all: state.todos,
      visibleTodos: getVisibleTodos(state)
    }
  }
}

export default connect(mapStateToProps)(TodoApp)
```

这个例子，就算 state.todos 和 getVisibleTodos(state) 每次都是同一个 引用对象， 也会导致re-render，因为 mapStateToProps 返回 object 中的 todos 每次都是一个新的对象。所以务必要小心这种写法。(目前formtastic中的 dashboard.js 都是这么写，按这边的说法，每次都会导致 re-render)

__注意__: 通常mapStateToProps只返回root state中的一部分数据, 当然也有可能包含非 root state 的信息，上面第二个例子，将state的信息再包装一层作为 mapStateToProps 的返回值，会导致这个Component不关心的数据发生了变化，也会导致该组件的re-render

### 为什么对可变对象进行引用比较不会有期望的结果

这个问题很好理解，如果reducer每次是直接对slice state进行修改，然后返回slice state，那么采用 引用比较，每次都是返回true，哪怕slice state已经发生了变化，这样就会导致 React-Redux 没办法正常 re-render

### 对可变对象进行引用比较是否会导致 Redux 有问题

这个问题的答案是否，即 可变对象进行引用比较 不会对 Redux 产生影响，但是会影响到依赖于 store 的library，比如 React-Redux。下面说明下用可变对象，会是怎样一个情况

1. 首先reducer接收一个可变的slice state，然后再reducer里对 slice state 进行修改，并且返回修改后的 slice state
1. 假设其他reducer也是用可变的slice state，或者其他 reducer 没有对 slice state 进行修改，那么 combineReducers 对每一个reducer返回的state进行 引用比较 的话，hasChange 会返回 false
1. hasChange 虽然是返回 false，但是由于 reducer 是直接修改了 slice state，那么最终的 root state 其实已经发生了变化，所以state还是正常被修改了，Redux 并没有因为用了 可变对象 就有问题
1. 但是由于hasChange返回false，combineReducers 最终会返回当前的 root state，那么 React-Redux 在对 root state 进行 引用比较 后也是返回 false，那么就不会 re-render component了，但其实root state 已经发生变化了，而 Component 却不会re-render，就有问题了

### 为什么一个 selector 修改和返回一个持久化的对象，这个对象是 mapStateToProps 的一个值，这种情况 wrappedComponent 却不 re-render

这个问题有点绕，看一个具体的例子就清楚了

``` javascript
// State object held in the Redux store
const state = {
  user: {
    accessCount: 0,
    name: 'keith'
  }
}

// Selector function
const getUser = state => {
  ++state.user.accessCount // mutate the state object
  return state
}

// mapStateToProps
const mapStateToProps = state => ({
  // The object returned from getUser() is always
  // the same object, so this wrapped
  // component will never re-render, even though it's been
  // mutated
  userRecord: getUser(state)
})

const a = mapStateToProps(state)
const b = mapStateToProps(state)

a.userRecord === b.userRecord
//> true
```

上面这个例子，userRecord 的值是通过 getUser(state) 这个selector计算，在这个 selector 里，直接修改了 state，并且返回结果作为 userRecord 的值，但是返回的结果自身引用并没有发生变化，那么在前后两次的 引用比较，即 a.userRecord === b.userRecord，就会返回 true，那么就表示没有发生变化，所以不会引起 re-render

### 在 redcuers 中采用 immutability， 什么情况还是会导致不必要的 component re-render

虽然我们推荐 redcuers 要返回一个 slice-state 的copy object，但这个是针对 slice state 有修改的情况；如果 slice state 没有修改，我们返回一个 slice state 的copy object，那么最终 combineReducers 进行 引用比较 时，会判断不是同一个对象，即 hasChange 为 true，那么就会导致 wrapped component 可能re-render（这边用可能是因为，wrapped component 还会对 mapStateToProps 返回的对象 进行比较）。这个问题很容易避免，那就是如果 slice state 没有变化，那么就直接返回 传递进来的 slice state 即可，不要返回 copy object。

### 在 mapStateToProps 中采用了immutability，什么情况还会导致不必要的 re-render

这个问题会发生在，propObject(mapStateToProps的返回值) 中的值是通过 selector 返回的情况，如果 selector 基于 immutability 返回了一个 新object，那么后面的 引用比较 就会判断不是同一个对象，但实际是前后两次的 object 虽然引用不同，但是值确实一样的；这个问题类似于上一个问题，即slice state其实是没有变化，但我们却返回了一个copy，导致不必要的re-render。还是看个例子

``` javascript
const getVisibleTodos = todos => todos.filter(t => !t.completed)

const state = {
  todos: [
    {
      text: 'do todo 1',
      completed: false
    },
    {
      text: 'do todo 2',
      completed: true
    }
  ]
}

const mapStateToProps = state => ({
  // getVisibleTodos() always returns a new array, and so the
  // 'visibleToDos' prop will always reference a different array,
  // causing the wrapped component to re-render, even if the array's
  // values haven't changed
  visibleToDos: getVisibleTodos(state.todos)
})

const a = mapStateToProps(state)
//  Call mapStateToProps(state) again with exactly the same arguments
const b = mapStateToProps(state)

a.visibleToDos
//> { "completed": false, "text": "do todo 1" }

b.visibleToDos
//> { "completed": false, "text": "do todo 1" }

a.visibleToDos === b.visibleToDos
//> false
```

这个例子里 getVisibleTodos() 这个selector 通过 Array 的 filter 每次都返回了一个新的对象引用，后面进行 引用比较 就会判断不是同一个对象，导致re-render。但实际我们要的只是completed为false的那个对象，只要返回这个对象即可，无需对这个对象进行copy。这个问题隐藏得比较深，不太容易被发现

### 有什么方法可以用来处理数据的 immutability，是否一定要用 Immutable.js

不一定非得用 Immutable.js 来实现，也纯的js也是可以做到，比如 spread operator 等，只不过用纯 js 的方式来实现，会比较麻烦，一是写法要比较罗嗦，二是很容易不小心就修改了数据，一旦碰到问题会很难被察觉到，也很难跟踪到问题的根源。使用纯 JS 的方式，还会有一个问题，那就是 性能 会比较差。相比于用 Immutable.js，两者会相差 100 倍的性能差异，主要原因是纯 JS 要保证 immutability，需要对没有修改的数据也进行数据拷贝，而这种拷贝的成本是很高的，数据结构越复杂，拷贝成本越高。Immutable.js 内部是通过共享 数据 的方式，来解决数据拷贝的问题，所以性能好很多，具体细节有待进一步研究。