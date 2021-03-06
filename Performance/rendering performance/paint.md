# 简化绘制的复杂度、减小绘制区域

+ 除 transform 或 opacity 属性之外，更改任何属性始终都会触发 paint
+ 绘制通常是像素管道中开销最大的部分；应尽可能避免 paint
+ 通过层的提升和动画的编排来减少绘制区域
+ 使用 Chrome DevTools 绘制分析器来评估绘制的复杂性和开销；应尽可能降低复杂性并减少开销。

## 触发布局与绘制

触发 Layout，则总是会触发 paint，因为更改任何元素的几何属性意味着其像素需要修正！

如果更改非几何属性，例如背景、文本或阴影，也可能触发绘制。在这些情况下，不需要布局

## 使用 Chrome DevTools 快速确定绘制瓶颈

使用 Chrome DevTools 来快速确定正在绘制的区域。打开 DevTools，按下键盘上的 Esc 键。在出现的面板中，转到“rendering”标签，然后选中“Show paint rectangles”。

打开此选项后，每次发生绘制时，Chrome 将让屏幕闪烁绿色。如果看到整个屏幕闪烁绿色，或看到您认为不应绘制的屏幕区域，则应当进一步研究。

## 提升移动或淡出的元素

## 减少绘制区域

## 降低绘制的复杂性