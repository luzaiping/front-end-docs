# 坚持仅合成器的属性和管理层计数

合成是将页面的已绘制部分放在一起以在屏幕上显示的过程。

此方面有两个关键因素影响页面的性能：需要管理的合成器层数量，以及您用于动画的属性。

+ 坚持使用 transform 和 opacity 属性更改来实现动画。
+ 使用 will-change 或 translateZ 提升移动的元素。
+ 避免过度使用提升规则；各层都需要内存和管理开销。

## 使用 transform 和 opacity 属性更改来实现动画

性能最佳的像素管道版本会避免布局和绘制，只需要合成更改.

为了实现此目标，需要坚持更改可以由合成器单独处理的属性。目前只有两个属性符合条件：transforms 和 opacity.

使用 transform 和 opacity 时要注意的是，您更改这些属性所在的元素应处于其自身的合成器层。要做一个层，您必须提升元素，后面我们将介绍方法。

## 提升您打算设置动画的元素

应当将您打算设置动画的元素（在合理范围内，不要过度！）提升到其自己的层：

```css
.moving-element {
  will-change: transform;
}
```

对于旧版浏览器，或者不支持 will-change 的浏览器：

```css
.moving-element {
  transform: translateZ(0);
}
```

## 管理层并避免层数激增

层往往有助于性能，知道这一点可能会诱使开发者通过以下代码来提升页面上的所有元素：
```css
* {
  will-change: transform;
  transform: translateZ(0);
}
```
这是以迂回方式说您想要提升页面上的每个元素。此处的问题是您创建的每一层都需要内存和管理，而这些并不是免费的。事实上，在内存有限的设备上，对性能的影响可能远远超过创建层带来的任何好处。每一层的纹理都需要上传到 GPU，使 CPU 与 GPU 之间的带宽、GPU 上可用于纹理处理的内存都受到进一步限制。

## 使用 Chrome DevTools 来了解应用中的层

要了解应用中的层，以及某元素有层的原因，您必须在 Chrome DevTools 的 Timeline 中启用绘制分析器