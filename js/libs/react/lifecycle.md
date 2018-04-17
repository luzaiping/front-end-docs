# React组件的生命周期

这部分主要记录React组件的生命周期有哪些，每个生命周期的作用和常见用法，以及什么情况生命周期方法会执行，执行时的顺序是如何；另外也包括什么多层组件之间，这些方法是如何执行

## 组件生命周期方法详解

React官方文档里关于组件的生命周期方法总共定义了9种，包括:

+ constructor
+ componentWillMount
+ render
+ componentDidMount
+ componentWillReceiveProps
+ shouldComponentUpdate
+ componentWillUpdate
+ componentDidUpdate
+ componentWillUnmount

__注意__：有些资料有讲到另外2个方法：__getDefaultProps__ 和 __getInitailState__, 这2个方法只有使用 create-react-class 创建组件才能定义，实际中很少用到.

### render()

+ 只能返回一个ReactElement 或 false, undefined, null
+ 这个函数必须是pure, pure, pure
+ 不可以在这个函数里执行 setState()

### constructor(props)

很明显，这个方法就是构造函数，在component mount 到 DOM前被执行。如果 component 不需要初始化 state，也不需要bind function，那么就无需定义该方法。

该方法接受一个props参数，这个就是父组件传递过来的props；但是不能在该方法里访问this.props，因为此时this还没被创建完。另外一定要先调用 super(props), 才可以定义其他语句。

一个典型的constructor写法：

```javascript
constructor(props) {
    super(props)
    this.state = {
        color: props.initialColor
    }
    this.onChange = this.onChange.bind(this)
}
```

__注意__：关于为什么要在 constructor 里 bind function，而不是直接在 render 里bind，会有另外一篇笔记进行说明

上面这个例子里，color 的初始值是由 props 进行赋值。官方不推荐这么做，因为 props 的值变更后，state可能没有马上进行更新，导致信息不一致。对于这个问题，官方推荐采用 [lift the state up](https://facebook.github.io/react/docs/lifting-state-up.html) 的做法。就是将state的值，交由父组件进行管理，父组件在props里提供 data 和 updateMethod，供子组件进行访问和修改。

__该方法要点__：

+ 初始化 state
+ bind function
+ 只能通过 props 访问，不可以用 this.props

### componentWillMount()

在 mount 前被立即执行, 即在 render() 前执行；在这个方法里执行 setState() 不会引起 re-rendering，不过一般不建议用这个方法，而是推荐用 constructor 来代替这个方法。当然如果是涉及到 server rendering, 那么只能用这个方法了，因为这个是唯一的hook。这个只有首次 render 才会执行，后面的 state 和 props 改变，是不会触发该方法的执行。

__该方法要点__：

+ 执行 setState() 不会触发 re-rendering
+ 建议用 constructor 代替该方法
+ 涉及 server rendering, 该方法是唯一的 hook
+ initial render 才会执行该方法，state 和 props 改变，不会触发该方法的执行

### componentDidMount()

在mount后立即执行，即在 render 后执行，所有需要 Dom 的操作，应该在该方法里执行，其他方法 Dom 都还没有构建完成。另外获取数据的异步请求，也应该在该方法里执行。在该方法里执行 setState() 会触发 re-rendering

__该方法要点__：

+ 可以在该方法执行Dom操作
+ 通常在该方法执行异步请求获取数据
+ 在该方法执行 setState() 会触发 re-rendering
+ initial render才会执行该方法，后面的 state 和 props 改变，不会执行到该方法

### componentWillReceiveProps(nextProps)

__该方法要点__：

+ 在 mounted component 接收到 nextProps 前执行
+ 需要比较 this.props 和 nextProps, 确定有发生变化后再执行对应的操作
+ props 发生改变 或者 父组件引起当前组件re-render, 这2种情况都会执行该方法，所以一定要比较前后2个props(管理后台情感化： Resource -> ImagePreview, 这边 Resource 里的 state 发生变化，就引起 ImagePreview 的 re-render, 从而调用了componentWillReceiveProps，而实际 ImagePreview 的 props 并没有发生变化)
+ 一旦需要执行对应操作，需引用正确的props (之前在做管理后台的情感化资源图片的显示时，就是因为引用错了props，导致功能异常。实际应该引用 nextProps，却引用了this.props)
+ 组件的 initial render 不会执行这个方法

这个方法最常用，记得一定要对前后2次 props 进行比较，确定有改变才执行对应操作。关于父组件引起子组件 re-render 的情形，在后面说明。

### shouldComponentUpdate(nextProps, nextState)

该方法必须返回一个boolean值，用于判定 state 或 props 发生改变后，是否需要 re-render

__该方法要点__：

+ return false 只会阻止当前组件的 re-render，而如果子组件 state 或 props 发生改变，还是会照样 re-render，跟父组件shouldComponentUpdate无关
+ 目前 return false，会阻止当前组件后续的 componentWillUpdate, render, componentDidUpdate 的执行；以后的React版本，可能这个只是一个hint，而不会真正阻止re-render
+ 一般不建议实现这个方法，如果一定要的话，那么需要分别比较 this.props 和 nextProps; this.state 和 nextState
+ 组件的 initial render 不会执行到这个方法

### componentWillUpdate(nextProps, nextState)

__该方法要点__：

+ 不要在该方法执行setState(), 如果要调用的话，要在 componentWillReceiveProps 里执行
+ 该组件的 initial render 不会执行到这个方法

### componentDidUpdate(prevProps, prevState)

注意参数名称已经变成 prevProps 和 prevState, 说明这个方法是在render后执行

__该方法要点__：

+ 可以在该方法里执行 DOM 操作
+ 通过比较前后 props 和 state，来判断是否需要执行网络请求
+ 组件的 initial render 不会执行到这个方法

### componentWillUnmount()

在组件即将 unmount 和 destroy 前执行，适合做一些清理工作：比如去掉 timer, cancel network request, 清理在 componentDidMount 中创建的 DOM Element

### getDefaultProps()

这个函数只有通过 React.createClass 创建才可以定义，如果是ES6的方式，要用 MyComponent.defaultProps 进行定义

### getInitialState()

这个函数只有通过 React.createClass 创建才可以定义，如果是ES6的方式，在constructor中通过 this.state = {} 等效定义

## 组件生命周期阶段 和 执行顺序

React 组件的生命周期阶段分为首次 Render, state变更，props变更这3种情况，下面分别说明

### 首次Render

首次Render，涉及的生命周期方法和顺序如下：

constructor -> getDefaultProps -> getInitialState -> componentWillMount -> render -> 递归子组件的初始化(从constructor 到 componentDidMount) -> componentDidMount

执行到render时，如果有子组件，那么就开始子组件的生命周期，如果子组件还有子组件，继续子子组件的生命周期，最内层的子组件componentDidMount执行完后，再依次往上执行，直到最上面的组件完成componentDidMount

### state变更

state变更也会触发一系列生命周期方法的执行

shouldComponentUpdate -> componentWillUpdate -> render -> 递归子组件的更新(从 shouldComponentUpdate 到 componentDidUpdate) -> componentDidUpdate

### props变更

props 变更执行的方法和顺序同 state 变更类似，只是最前面多了个 componentWillReceiveProps

componentWillReceiveProps -> shouldComponentUpdate -> componentWillUpdate -> render -> 递归子组件的更新(从 componentWillReceiveProps 到 componentDidUpdate) -> componentDidUpdate

## 多层级组件之间生命周期方法的执行

涉及执行顺序，哪些情况会触发执行，哪些不会

### 执行顺序

#### componentDidMount 和 componentDidUpdate 执行顺序

这2个生命周期方法，是从最内层的child开始执行, 然后往上一层, 直到最上面的parent，即从下往上的执行顺序：

Component-1.1.1 -> Component-1.1 -> Component-1

#### 其他生命周期方法的执行顺序

其他方法的执行顺序跟 componentDidMount 刚好相反，是从上往下的顺序执行，即先执行父组件，再执行子组件

### 触发情况

#### componentDidMount

+ 重新Route进来，都会执行componentDidMount
+ 刷新当前页面，也会执行componentDidMount(前提是该组件是正常mount，而不是需要某些条件才mount)

#### componentWillUnmount 触发情况

+ 路由引起当前组件所在页面销毁的话，会执行该页面里所有组件的componentWillUnmount(只针对正常mount的情况，比如当前页面里的弹窗，是需要某些条件才可以出现，路由发生变话，这种组件是不会执行componentWillUnmount)
+ 刷新页面并不会执行 componentWillUnmount，因为刷新页面后，React 没有机会执行到该方法，如果要做一些清理工作，可以通过 window.onbeforeunload 来做

#### componentWillReceiveProps 触发情况

+ 传递到该组件的props发生变化了，该方法会被执行
+ 任何上层组件(父组件、祖父组件...)的props发生变化，该方法也会被执行，哪怕自身props没有发生变化
+ 父组件re-render，可能也会引起该方法执行，哪怕自身props没有发生变化

__注意__：所以要在该函数内，判定 nextProps 和 this.props 里的值是否发生变化

## 其他Tips

+ 刷新页面不会引起componentWillUnmount 的执行
+ 通过变量动态添加组件，那么每次都会新增一个组件；通过变量在组件内控制该组件的隐藏、显示，那么该组件只会被创建一次，即componentDidMount只被执行一次

![React生命周期](lifecycle.png)