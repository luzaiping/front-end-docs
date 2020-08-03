# 优化 js 的执行

JavaScript 经常会触发视觉变化。有时是直接通过样式操作，有时是会产生视觉变化的计算，例如搜索数据或将其排序。时机不当或长时间运行的 JavaScript 可能是导致性能问题的常见原因。您应当设法尽可能减少其影响。

JavaScript 性能分析可以说是一门艺术，因为您编写的 JavaScript 代码与实际执行的代码完全不像。现代浏览器使用 JIT 编译器和各种各样的优化和技巧来尝试为您实现尽可能快的执行，这极大地改变了代码的动态。

尽管如此，您肯定还是可以做一些事情来帮助您的应用很好地执行 JavaScript。

+ 对于可视化变更，避免使用 setTimeout 和 setInterval，而是要使用 requestAnimationFrame 代替
+ 将长时间运行的js代码移到单独的 web workers
+ 使用 micro-tasks 来执行对多个 frame 的更改
+ 使用 devTools 的 Timeline 和 javascript profiler 来评估 js 代码的影响。

## 使用 requestAnimationFrame 来实现视觉变化

当屏幕正在发生视觉变化时，您希望在适合浏览器的时间执行您的工作，也就是正好在 frame 的开头。保证 JavaScript 在 frame 开始时运行的唯一方式是使用 requestAnimationFrame
```javascript
function updateScreen(time) {
  // Make visual updates here.
}
requestAnimationFrame(updateScreen);
```
使用 setTimeout 或者 setInterval 不能保证 callback 在 frame 的哪个时间点执行，如果是在 frame 的最后才执行，这样就会出现丢帧(miss a frame), 导致卡顿(jank)

## 降低复杂性或使用 Web Worker

js 是运行在浏览器的主线程, 恰好和 style calculations, layout, 及许多情况下的paint 一起运行。如果 js 运行时间过长，就会 block 其他工作，从而导致丢帧。

因此需要妥善处理js何时运行以及运行多久。如果是在滚动之类的animation中，最好是让js保持在3~4毫秒的范围内。如果是在浏览器空闲时间里，就可以都一些运行时间。

许多情况下，可以将纯计算工作移到 web worker 上。因为它不需要对 DOM 进行访问。数据操作和遍历 或者 排序，搜索 都是比较合适的场景。

## 了解 JavaScript 的“帧税” (frame tax)

在评估一个框架、库或您自己的代码时，务必逐帧评估运行 JavaScript 代码的开销。当执行性能关键的动画工作（例如变换或滚动）时，这点尤其重要。

测量 JavaScript 开销和性能情况的最佳方法是使用 Chrome DevTools 的 performance panel。在这边可以看到主线程每个函数的执行时间。找出哪些运行时间长的代码，看看是否可以通过修改将他们移除掉(使用算法)，或者将他们移到 web worker，从而不会占用主线程的资源。

## 避免微优化 JavaScript

知道浏览器执行一个函数版本比另一个函数要快 100 倍可能会很酷，比如请求元素的offsetTop比计算getBoundingClientRect()要快，但是，您在每帧调用这类函数的次数几乎总是很少，因此，把重点放在 JavaScript 性能的这个方面通常是白费劲。您一般只能节省零点几毫秒的时间。