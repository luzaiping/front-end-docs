react 性能优化
=========================

## 避免重新渲染

### shouldComponentUpdate

shouldComponentUpdate(nextProps, nextState) 这个方法如果返回 false，那么就不会执行 render()，可以有效地避免不必要的渲染。

__注意:__ 一般不直接在这个方法上执行操作，官方提供了 PureComponent 来实现同等功能

### PureComponent

使用 PureComponent 会自动启用 shouldComponentUpdate, 在这个方法里会对前后的 props 和 state 进行 __浅比较__ , 如果是遵循 immutable 的原则，就能快速地比较前后的值，从而决定是否需要重新渲染组件。由于是进行 浅比较, 因此无比确保 immutable，否则会导致 props 和 stats 发生改变，但实践却没有重新渲染的问题。

### 避免在 render 中创建新的函数

这个场景最常见，经常会将处理事件用 arrow funciton 形式定义，每次 render 都会创建一个新的 arrow function，如果这个 arrow function 作为子组件的 props，那么就会导致 子组件被重新渲染。这个问题的常见解决办法就是将处理事件定义在 constructor 中，作为 this 的属性。

### 避免将 常量值 作为 props

这个场景跟上面的类似，就说直接将 常量值 作为 props 传给子组件

```javascript
<Item statuses={['open', 'close']} />
```

比如这个例子，statuses 每次都是一个新的引用值，就会导致 Item 组件重新渲染。解决办法很简单，就是在 consturctor 中定义一个常量值，然后引用那个常量值就好了。

### 使用工具进行检测

使用 why-did-you-update 这个 npm 包，只应用在 dev 模式就可以，这个工具包，可以在 console 中看到当前页面是否有不必要的渲染存在。