# context 

react 16.3 前后对于 context 的实现是不同；这边以 16.3之后的API 为准

## React.createContext

React.createContext 用于创建一个 context instance, 这个方法只接收一个参数 value

```javascript
import React from 'react';
const MyContext = React.createContext('red');
export default MyContext;
```
参数 value 可以是任意合法的 js 值，比如 object, number, boolean。创建好的 instance 需要 export 供 provider 和 consumer 使用。该参数可以为空。

## Context.Provider

每一个创建好的 context instance 都有 Provider 属性, 这个 Provider 属性指向的是一个 Component, 该 Component 接收一个 value 的 prop, 这个 value 会 replace context 实例化的参数值，这个也是最终要传递给子孙Component的值。

```javascript
<MyContext.Provider value={'green'}>
  {this.props.children}
</MyContext.Provider>
```

## Class.contextType

Class 的 contextType 可以赋值为通过 React.createContext() 创建好的 context instance. 这样让当前 Class 可以 consume 最近的 Provider (必须是相同context才可以), 引用 Provider 的 value 值是通过 this.context 得到, 可以在 Component的任何地方引用

```javascript
Class MyClass extends React.Component {
  componentDidMount() { let value = this.context }
  componentDidUpdate() { let value = this.context }
  compoentDidUnmount() { let value = this.context }
  render() { let value = this.context }
}
MyClass.contextType = MyContext; // 这边的 MyContext 是 React.createContext() 创建的 instance
```

## Context.Consumer

和 Context.Provider 一样, Context.Consumer 也是 Component, subscribes to context changes. This lets you subscribe to a context within a function component.

这个要求 Consumer component 的 child 是一个 function (也就是 render props pattern), 该 function 接收 current context value, 返回一个 React node. 接收的 value 就是 最近 Provider 提供的 value, 如果没有对应的Provider, 那么就读取 context 的 defaultValue (也就是 createContext() 的参数值)

## Multiple Provider

Context.Consumer 和 Class.contextType 都可以用来获取 Provider 的 value,  Class.contextType 使用起来会更方便一点, 缺点是只能consume 一个 provider; Context.Consumer 可以同时 consume 多个 provider，适合复杂场景，比如：

```javascript
class App extends React.Component {
  render() {
    const {signedInUser, theme} = this.props;

    // App component that provides initial context values
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
```

这边提供应用2个 Provider, Layout 下面假设有个 Content component, 要获取这 2个 provider 的值：

```javascript
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => ( // 获取第一个 provider 的 value
        <UserContext.Consumer>
          {user => ( // 获取第二个 provider 的 value
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

## Provider pattern

react-redux 这个library，提供了一个 Provider component 和 connect function, 就是使用了 context. provider 包含如下代码：

```javascript
render() {
  const Context = this.props.context || ReactReduxContext

  return (
    <Context.Provider value={this.state}>
      {this.props.children}
    </Context.Provider>
  )
}
```

将 this.state (这个内部是一个 object 对象，包含了 store) 作为 provider value, 这样后续的 component 就都可以访问 store。 react-redux 是通过 connect() 返回一个 HOC (high order component), 这个 HOC 接收 wrappedComponent 参数，返回一个新的 component 也叫 connectedComponent (也就是 container )。在 connnectedComponent 应用了 context.Consumer 或 Class.contextType 得到 store, 然后将 store 作为参数传给 mapStateToProps, mapDispatchToProps, 在 connectedComponent 执行 上面这2个函数，从而将 mapState 和 mapDispath 传给 wrappedComponent, 所以实际开发中, wrappedComponent(也就是我们写的 component) 并不需要再通过 context.Consumer 或者 Class.contextType 显示获取 store。

```javascript
// connect() is a function that injects Redux-related props into your component.
// You can inject data and callbacks that change that data by dispatching actions.
function connect(mapStateToProps, mapDispatchToProps) {
  // It lets us inject component as the last step so people can use it as a decorator.
  // Generally you don't need to worry about it.
  return function (WrappedComponent) {
    // It returns a component
    return class extends React.Component {
      render() {
        return (
          // that renders your component
          <WrappedComponent
            {/* with its props  */}
            {...this.props}
            {/* and additional props calculated from Redux store */}
            {...mapStateToProps(store.getState(), this.props)}
            {...mapDispatchToProps(store.dispatch, this.props)}
          />
        )
      }
    }
  }
}
```

这是一个包含核心 connect 结构的代码(实际代码要比这个复杂得多)。

```javascript
let hoc = connect(mapStateToProps, mapDispathcToProps);
let container = hoc(wrappedComponent)
```

上面将 connect 拆成两次调用，首次得到 hoc，再调用 hoc 得到 container, wrappedComponent 是 container 的 child。 container 才是真正需要用到 provider value (也就是 store) 的 Consumer