前端工程师的自检清单 - React 篇
=========================
内容参考自[掘金-一个前端工程的自检清单](https://juejin.im/post/5cc1da82f265da036023b628)。该文章列出了清单内容，这边会对清单项进行解答。

1. React和vue选型和优缺点、核心架构的区别

2. React中setState的执行机制，如何有效的管理状态
> 内部通过 BatchingStrategy 的 isBatchingUpdate 判断要如何处理 setState，如果是 true，就将组件放入 dirtyComponents，如果是 false 就立马调用 transaction.perform 处理。放入 dirtyComponents 会等下一次 transaction.perform 再执行，因此看起来像是异步操作

> 状态管理，如果不需要依赖于前一个状态，可以直接使用 setState(obj) 的形式，如果需要依赖前一个状态，就使用 setState(updater) 形式，或者带有 callback 的形式

3. React的事件底层实现机制
> React 自身实现了一套事件系统。事件是注册的顶层元素 Document 元素上(MediaEvent除外)。每种类型只会注册一次，注册的事件处理函数，是React内部实现的listener。触发事件是从 dispathEvent 开始，这个会先获取 event.target 以及对应的 react 实例。然后获取对应的 SyntheticEvent 事件对象列表 (根据事件类型 -> SyntheticEvent 子类 -> 从对象池获取事件对象)，递归事件对象列表，按事件传播方向进行两阶段的事件对象添加 ，从而得到 dispatchingListeners，然后 batch 执行 listeners (如果事件是 propragation 就跳过)，执行完后如果不是 persist 状态，就将事件对象回收到池里供下次使用

4. React的虚拟DOM和Diff算法的内部实现
> 虚拟 DOM：通过 React.createElement 创建 VOM；通过 ReactDOM.render() 开始将 VDOM -> 真实 DOM (_renderSubTreeIntoContainer -> _renderNewRootComponent -> batchMountComponentIntoNode -> mountComponentIntoNode -> mountComponent -> _mountImageIntoNode)

> diff 算法策略
>> 1. Web UI 中 DOM 节点跨层级的移动操作特别少，可以忽略不计
>> 1. 用于相同类型的两个组件将会生成相似的树形结构，拥有不同类的两个组件将会生成不同的树形结构
>> 1. 对于同一层级的一组子节点，它们可以通过唯一 id 进行区分。

>> 在上面三个策略的基础上，React 分别将对应的 tree diff， component diff， 以及 element diff 进行算法优化。
>> 1. tree diff: 基于策略一，React 对树进行分层比较，两棵树只会对同一层级的节点进行比较。(如果有跨层级的移动操作，就采用添加新节点，删除旧节点的方式进行操作)
>> 1. component diff: 同类型组件，按照原策略继续比较 VDOM；不同组件，将组件判定为 dirtyComponent，从而替换整个组件下的所有子节点；同一组件，有可能 VDOM 没有变化，可以通过 shouldComponentUpdate 来告知是否要进行diff算法
>> 1. element diff: 同一层级下一组子节点，借用 key 来优化

5. React的Fiber工作原理，解决了什么问题

> 原理：将渲染拆分为 Rconcilation 和 Commit 阶段，而之前是一边 diff，一边提交。
>> Rconcilation (协调阶段)：可以认为是 diff 阶段，这个阶段是可以中断。这个阶段会找出所有变更节点。比如节点新增、删除、属性变更等。这些变更，React称之为 effect (副作用)。以下生命周期函数会在协调阶段被调用：
>>> + constructor
>>> + componentWillMount 废弃
>>> + componentWillReceiveProps 废弃
>>> + static getDerivedStateFromProps
>>> + shouldComponentUpdate
>>> + componentWillUpdate 废弃
>>> + render

>> Commit (提交阶段)： 将上一个阶段计算出来的需要处理的 Effect 一次性执行。这个阶段必现同步执行，不能被打断。下面几个生命周期函数在提交阶段被执行：
>>> + getSnapshotBeforeUpdate
>>> + componentDidMount
>>> + componentDidUpdate
>>> + componentWillUnmount

也就是说，在协调阶段如果时间片用完，React 就会主动让出控制权。因为协调阶段执行的工作不会导致任何用户可见的变更，所以在这个阶段让出控制权不会有什么问题。

因为协调阶段可能被中断、恢复甚至重做。因此 React 协调阶段的生命周期函数可能会被多次调用。因此建议协调阶段的生命周期函数不要包含副作用。这也是为什么 React 16 开始废弃 componentWillMount、componentWillReceiveProps 和 componentWillUpdate

> 解决问题：原有 Stack Reconcilation 会一直运行到渲染结束，会长期霸占 cpu 资源，导致浏览器其他任务都得不到及时响应，从而影响用户体验。新的 Fiber 架构要实现 Rconcilation 过程可以中断，可以 `适时` 让出 CPU 执行权，这个除了可以让浏览器及时响应用户的交互，还有其他好处：
+ 相比于一次性操作大量 dom，分批延时对 DOM 进行操作，可以得到更好的用户体验
+ 给浏览器一些喘息的机会，它会对代码进行编译优化 (JIT) 及进行热代码优化，或者对 reflow 进行修正

6. React Router 和 Vue Router的底层实现原理、动态加载实现原理
> hash & H5 history
> 动态加载实现原理不清楚 ？？？

7. 可熟练应用React API、生命周期等，可应用HOC、render props、Hooks等高阶用法解决问题
> 生命周期
>> Rconcilation阶段：constructor -> static getDerivedStateFromProps -> render
>> Commit 阶段：getSnapshotBeforeUpdate -> componentDidMount / componentDidUpdate -> componentWillUnmount

8. React Hooks 原理
> 基本都掌握，通过实践加强

9. 基于React的特性和原理，可以手动实现一个简单的React
> 基本都掌握