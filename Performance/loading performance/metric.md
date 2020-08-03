# metric (性能指标)

## 指标解析

FP: first paint
FCP: first contentful paint   浏览器首次渲染出内容，可以是 文本，图片，svg 或者 canvas

paint timing API ( PerformanceObserver )定义了这2个 metric , 在 navigation 后马上进行记录，这2个的主要区别是，FP 标记浏览器渲染任何在视觉上不同于导航前屏幕内容的时间点。FCP 标记的是浏览器渲染来自 DOM 第一位内容的时间点，该内容可能是文本、图像、SVG 甚至 canvas 元素。 通常 FP 要早于 FCP.
FMP: first meaningful paint. 标记页面首次出现最有意义内容的时间点。关于最有意义内容，不同页面有不同的评判标准

Long Tasks：标识那些运行时间超过 50ms 的任务。可以通过 Long_Tasks_API 将这些任务暴露给 开发者，也就是通过编码方式发现这些任务，从而进行优化. long tasks 会导致页面 滞后 或者 卡顿

TTI: time to interactivity， 用于标记应用已进行视觉渲染并能可靠响应用户输入的时间点

这几个指标 和 用户体验的对应关系如下：

体验	                  指标

是否发生？	首次绘制 (FP)/首次内容绘制 (FCP)

是否有用？	首次有效绘制 (FMP)/主角元素计时

是否可用？	可交互时间 (TTI)

是否令人愉快？	耗时较长的任务（在技术上不存在耗时较长的任务）

![metric](images/perf-metrics-load-timeline.png)

## 测算这些指标

### tracking FP/FCP

使用 Google Analytics 这个异步服务进行编码测算

### tracking FMP

不同页面的FMP，没有明确的时间点，不好直接测算。这个链接提供了一个思路 https://speedcurve.com/blog/user-timing-and-custom-metrics/

### tracking TTI

使用 [tti-polyfill.js](https://github.com/GoogleChrome/tti-polyfill)

### tracking long tasks

使用 PerformanceObserver 进行编码跟踪

### tracking input latency (输入延迟)

输入延时，是因为long task影响导致，可以在事件上面进行时间测算，将事件时间戳和当前时间进行比较，如果两者时间超过100ms，就进行报告。

## 优化这些指标

### 优化 FP/FCP

从 html head 元素里移除任何 render blocking 的 scripts 或者 css，这边说的应该是 单独请求的外部资源，如果这些 scripts 或者 css 是必须马上加载，那就 inline 到 html 里，这样可以减少请求时间

### 优化FMP/TTI

只加载最核心的那部分bundle，其他不是马上需要用到的资源，通过延迟加载推到后面去加载。这个跟 code split 和 lazy loading 和 安排资源加载顺序 有关。

### preventing long tasks

除了将代码拆分为多个单独的文件之外，您还可将大型同步代码块拆分为较小的块，以便以异步方式执行，或者推迟到下一空闲点

### preventing regressions (避免性能下降)

将 lighthouse 和 web page test 工具整合到 持续集成服务器 (CI server) 中，或者编写代码，在关键指标下降退化或者下降到特定阈值的时候判定为失败。