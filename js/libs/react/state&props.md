# state & props

## state
state 是 component 内部的data，由 component 自己管理，不需要外部传入进来。但是 state 可以作为 props

往下传给 children

+ 只能在 constructor() 里对 this.state 进行赋值, 也就是初始化，在其他地方对 this.state 进行赋值，不会引起component进行更新
+ 通过调用 setState() 进行state变更，从而引起UI变化
+ setState()是异步操作，如果需要用到前一个状态的值来进行计算，要采用 setState(callbacck) 的调用，在 callback 里进行操作 

## props
props 是进行单向数据流的唯一传递方式，由 parent 传给 child，不可以是反过来。并且 props 是 immutable