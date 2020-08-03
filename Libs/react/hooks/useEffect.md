useEffect
====================

## deps

useEffect 不同 deps 作用是不一样：

+ 如果没有 deps，那么每次渲染(首次渲染或者因为状态变更引起的重新渲染)都会执行 callback
+ 如果 deps 是空数组，那么只有首次渲染会执行 callback，后续都不会再执行 callback
+ 如果 deps 是非空数组，那么任何一个数组项发生变化，都会重新执行 callback

## cleanup

useEffect 的 callback 可以返回一个函数，这个函数也叫 cleanup，根据 deps 不同，cleanup 执行情况也会不同

+ 如果没有 deps，组件有状态发生变化 或者 组件unmount (通常是离开页面), 都会执行 cleanup
+ 如果 deps 是空数组，那么只有组件 unmount 才会执行 cleanup
+ 如果 deps 是非空数组，那么任何一个数组项发生变化 或者 组件unmount，都会执行 cleanup

即组件 unmount 一定会执行 cleanup 函数

## callback

callback 也叫 effect function，这个 function 再每次渲染时都是不一样，由于函数有其闭包，所以会查找当时作用域里的变量，所以 callback 可以得到每次渲染时对应的 state

## effect 和 cleanup 执行时机

浏览器只会在 paint 后才会运行 effects，这样应用会更加流畅，因为大多数 effects 不会阻塞屏幕的更新

假设一个 useEffect 依赖一个 props，同时有 cleanup 函数，那么会按照下面的顺序执行：

+ React 渲染{id: 20}的UI。
+ 浏览器绘制。我们在屏幕上看到{id: 20}的UI。
+ React 清除{id: 10}的effect。
+ React 运行{id: 20}的effect。

这个例子，前一次 props 的 id 是 10，后一次 id 是 20；前一次的 cleanup 会在后一次 effects 的内容绘制到屏幕后才会执行。