# 渲染性能

页面不仅要加载得快，还得运行得平顺：滚动要能跟上手指的速度；动画和交互应该要平顺，不会卡顿。

要写出高性能的网站或者APP，就得理解浏览器是如何处理 html, js, css, 确保所写的代码能运行得尽可能高效。

## 60ps 和 设备刷新率

当前大多数设备的刷新频率是一秒60次。如果页面中有一个动画或者渐变效果，或者用户正在滚动页面，那么浏览器渲染动画或页面的每一帧速率也需要跟设备屏幕的刷新率保持一致。

每一帧的预算时间仅比16毫秒多一点点(1s/60=16.66毫秒)；而浏览器还有整理工作要做，所以实际代码要在10毫秒内完成，如果无法符合这个预算时间，帧率就会下降，那么屏幕内容就会抖动。这种现象通常称作卡顿(jank)，会对用户体验产生负面影响。

## the pixel pipe (像素管道)
有5个区域需要特别注意，这也是我们有最大控制权的部分，这些是 像素 到 屏幕 这一个过程(管道) 的关键点：
![](../images/frame-full.jpg)

+ javascript: 通常会使用JS来实现一些视觉变化的效果。比如使用 jquery 的 animation 函数、对一组数据进行排序、往页面里添加新的DOM。除了JS，还有其他方法可以实现视觉效果，比如 css animation、transactions 和 web animation API
+ style calculations: 这是根据匹配选择器计算出哪些css rule要应用到那些元素的过程。知道rule之后，就得应用rule，并且计算出每一个元素最终的样式。
+ Layout: 一旦浏览器知道一个element要应用哪些rules之后，就得计算element要占用多少空间，要在屏幕的哪个位置。网页的布局模型意味着一个element可能会影响其他elements。比如body的width, 会影响子元素的width,以此类推，会一直影响整个子树。因此对于浏览器来说，这个过程是经常发生的事情。
+ Paint: 这个是填充像素的过程。它涉及绘出文本、颜色、图像、边框、阴影，基本包括了一个 element 所有可视部分。paint 一般是在多个 layer 上完成。
+ Compositing: 由于页面的各个部分可能是绘制在不同 layers。因此它们需要按正确顺序绘制在屏幕上，以便正确渲染页面。对于与其他元素重叠的元素来说，这点特别重要，因为如果合并错误，会导致一个元素错误地出现在另一个元素的上层。

上面这5个部分都有可能会导致页面卡顿，因此务必准确理解代码会触发管道的哪个部分。

不一定每一帧都会经过管道每个部分的处理。不管是 js， css animation，还是 web animation，在实现视觉变化时，pipe 针对指定 frame 的运行通常有三种方式：

1. js/css > style > Layout > Paint > Composite

  如果代码修改了element的几何属性(比如 宽 高 top left), 那么浏览器就必须检查所有其他elements，然后 reflow the page. 任何受影响的区域都需要 repaint，然后最终 painted elements 都需要 composite 到一起

2. js/css > style > paint > composite
  
  如果只修改了 'paint only' 属性, 比如 background image, shadow, text color。换句话说修改没有产生页面 layout 变化，那么浏览器就会跳过 layout, 但仍会执行 paint

3. js/css > style > composite

  如果代码修改了不需要 layout 也不需要 paint 的属性，那么浏览器直接跳到执行 compositing。

最后这个版本是最期望的结果，比如 animations 或者 scrolling

## 优化js的执行

  1. requestAnimationFrame 的

## 减少复杂 css 表达式的计算


## 其他优化方法

## 不要过度使用开源库

  开源的库/框架给我们开发带来很大的便利性，比如jquery，但是如果只是使用这个库的一小部分功能，而把整个库/框架都引入进来，就有点得不偿失。

  像这种情况，建议是通过原生js/css来实现。

## http2

  上面提到的一个优化方式是__减少请求数__，这个是基友使用 http/1 的前提；如果使用 http/2，就不需要那些优化手段。http/2 是一个新的技术选择，解决了不少http/1的问题，不过在应用上目前可能会遇到点障碍。

  这个优化方案适合在技术选型时就确定，不太适合对已有项目/应用的优化。

## cdn

  将站点部署到cdn上，发挥电信运营商的网络优势，能有效缩短请求时间。

  当然这个优化方案跟前端开发没有直接关系。