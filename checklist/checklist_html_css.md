前端工程师的自检清单 - HTML/CSS篇
=========================
内容参考自[掘金-一个前端工程的自检清单](https://juejin.im/post/5cc1da82f265da036023b628)。该文章列出了清单内容，这边会对清单项进行解答。

## HTML

1. 从规范的角度理解HTML，从分类和语义的角度使用标签
> 这部分还需要再加强下，找本书，快速过一遍就行了

2. 常用页面标签的默认样式、自带属性、不同浏览器的差异、处理浏览器兼容问题的方式
> 参考[这篇文章](https://juejin.im/post/59a3f2fe6fb9a0249471cbb4)

3. 元信息类标签(head、title、meta)的使用目的和配置方法
> 不太会。要加强

4. HTML5离线缓存原理
> 参考[这篇文章](https://segmentfault.com/a/1190000006984353)

5. 可以使用Canvas API、SVG等绘制高性能的动画
> 需要加强

## CSS

1. CSS盒模型，在不同浏览器的差异
> 盒模型：border-box, content-box, 通过 box-sizing 设置。差异就是宽高的计算不同

2. CSS所有选择器及其优先级、使用场景，哪些可以继承，如何运用at规则
> 加强

3. CSS伪类和伪元素有哪些，它们的区别和实际应用
> 加强

4. HTML文档流的排版规则，CSS几种定位的规则、定位参照物、对文档流的影响，如何选择最好的定位方式，雪碧图实现原理
> 定位相关问题还好
> 雪碧图实现

5. 水平垂直居中的方案、可以实现6种以上并对比它们的优缺点 `*****`
> 参考[这篇文章](https://liuyib.github.io/2020/04/07/css-h-and-v-center/) 

6. BFC实现原理，可以解决的问题，如何创建BFC `*****`
> 参考[这篇文章](https://juejin.im/entry/59c3713a518825396f4f6969)

7. 可使用CSS函数复用代码，实现特殊效果
> calc(), var(), cubic-bezier(), rgb(), rgba(), hsl(), hsla(), linear-gradient(), radial-gradient(), repeating-linear-gradient(), repeating-radial-gradient()

8. PostCSS、Sass、Less的异同，以及使用配置，至少掌握一种
> easy

9. CSS模块化方案、如何配置按需加载、如何防止CSS阻塞渲染 `*****`
> CSS 模块化方案： OOCSS, SMACSS, BEM, SASS/LESS/STYLUS, css module, css-in-js(styled-component)
> 如何防止css阻塞渲染：通过 media 属性设置媒体查询 和 媒体类型，那css资源按需加载

10. 熟练使用CSS实现常见动画，如渐变、移动、旋转、缩放等等 `*****`
> 加强 (实操起来)

11. CSS浏览器兼容性写法，了解不同API在不同浏览器下的兼容性情况
> 了解即可

12. 掌握一套完整的响应式布局方案
> 方案有：
>> 1. 媒体查询
>>> 原理：给不同分辨率的设备编写不同的样式来实现响应式的布局。
>>> 缺点：浏览器大小发生变化后, 需要改变的样式太多，多套样式都需要跟着调整，很繁琐
>> 2. 百分比
>>> 原理：当浏览器的宽高发生变化，通过百分比可以使得元素的宽高随着浏览器的变化而变化，从而实现响应式的效果
>>> 缺点：计算困难，如果我们要定义一个元素的宽度和高度，按照设计稿，必须换算成百分比单位；各个属性中如果使用百分比，相对父元素的属性并不是唯一的
>> 3. rem
>>> 原理：页面大小发生变化后，动态更改html元素的font-size，这样 rem 所代表的值也就发生变化了。其他元素大小都是根据 rem 来计算，也就会响应发生变化
>>> 缺点：在响应式布局中，必须通过js来动态控制根元素font-size的大小。
>> 4. vw/vh
>>> 原理：vw 和 vh 是相比于 viewport 

可以[参考这篇文章](https://juejin.im/post/5b39905351882574c72f2808)

还需掌握移动端适配的相关概念

## 手写
1. 手写图片瀑布流效果
> 参考[这篇文章](https://zhuanlan.zhihu.com/p/55575862)

2. 使用CSS绘制几何图形（圆形、三角形、扇形、菱形等）
> 参考[这篇文章](https://blog.csdn.net/zhouziyu2011/article/details/59079959)

3. 使用纯CSS实现曲线运动（贝塞尔曲线）
> 实现原理就是使用 transition 或者 animation，可以参考[这篇文章](https://www.zhangxinxu.com/wordpress/2018/08/css-css3-%E6%8A%9B%E7%89%A9%E7%BA%BF%E5%8A%A8%E7%94%BB/)

4. 实现常用布局（三栏、圣杯、双飞翼、吸顶），可是说出多种方式并理解其优缺点
> 参考[这篇文章](https://juejin.im/post/5caf4043f265da039f0eff94)
> 这个问题感觉是比较早的知识点，目前应用并不多，先不花时间在这上面