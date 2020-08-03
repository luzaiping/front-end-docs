# 避免大型、复杂的布局和布局抖动

布局是浏览器计算各元素几何信息的过程：元素的大小以及在页面中的位置。 根据所用的 CSS、元素的内容或父级元素，每个元素都将有显式或隐含的大小信息。此过程在 Chrome、Opera、Safari 和 Internet Explorer 中称为布局 (Layout)。 在 Firefox 中称为自动重排 (Reflow)，但实际上其过程是一样的。

与样式计算相似，布局开销的直接考虑因素如下：
1. 需要布局的元素数量
1. 这些布局的复杂性。

## 尽可能避免布局操作

当您更改样式时，浏览器会检查任何更改是否需要计算布局，以及是否需要更新渲染树。对“几何属性”（如宽度、高度、左侧或顶部）的更改都需要布局计算。
```css
.box {
  width: 20px;
  height: 20px;
}
/**
 * Changing width and height
 * triggers layout.
 */
.box--expanded {
  width: 200px;
  height: 350px;
}
```
布局几乎总是作用到整个文档。 如果有大量元素，将需要很长时间来算出所有元素的位置和尺寸。

如果无法避免布局，关键还是要使用 Chrome DevTools 来查看布局要花多长时间，并确定布局是否为造成瓶颈的原因。打开 DevTools，选择“Timeline”标签，点击“record”按钮，然后与您的网站交互。当您停止记录时，将看到网站表现情况的详细分析。

## 使用 flexbox 而不是早期的 layout model

网页有各种布局模型，一些模式比其他模式受到更广泛的支持。最早的 CSS 布局模型使我们能够在屏幕上对元素进行相对、绝对定位或通过浮动元素定位。

## 避免强制同步布局

将一帧送到屏幕会采用如下顺序： ![](../images/frame-full.jpg)

首先 JavaScript 运行，然后计算样式，然后布局。但是，可以使用 JavaScript 强制浏览器提前执行布局。这被称为强制同步布局。(forced synchronous layouts)

要记住的第一件事是，在 JavaScript 运行时，来自上一帧的所有旧布局值是已知的，并且可供您查询。因此，如果（例如）您要在帧的开头写出一个元素（让我们称其为“框”）的高度，可能编写一些如下代码：

```javascript
// Schedule our function to run at the start of the frame.
requestAnimationFrame(logBoxHeight);

function logBoxHeight() {
  // Gets the height of the box in pixels and logs it out.
  console.log(box.offsetHeight);
}
```

如果在请求此框的高度之前，已经更改其样式，就会出现问题：

```javascript
function logBoxHeight() {

  box.classList.add('super-big'); // 已经更改了 高度

  // Gets the height of the box in pixels
  // and logs it out.
  console.log(box.offsetHeight);
}
```

现在，为了回答高度问题，浏览器必须先应用样式更改（由于增加了 super-big 类），然后运行布局。这时它才能返回正确的高度。这是不必要的，并且可能是开销很大的工作。

因此，始终应先批量读取样式（浏览器可以使用上一帧的布局值），然后执行任何写操作：

```javascript
function logBoxHeight() {
  // Gets the height of the box in pixels
  // and logs it out.
  console.log(box.offsetHeight);

  box.classList.add('super-big');
}
```
## 避免布局抖动

有一种方式会使强制同步布局甚至更糟：接二连三地执行大量这种布局。看看这个代码：
```javascript
function resizeAllParagraphsToMatchBlockWidth() {

  // Puts the browser into a read-write-read-write cycle.
  for (var i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = box.offsetWidth + 'px';
  }
}
```

循环的每次迭代读取一个样式值 (box.offsetWidth)，然后立即使用此值来更新段落的宽度 (paragraphs[i].style.width)。在循环的下次迭代时，浏览器必须考虑样式已更改这一事实，因为 offsetWidth 是上次请求的（在上一次迭代中），因此它必须应用样式更改，然后运行布局。每次迭代都将出现此问题！

此示例的修正方法还是先读取值，然后写入值：

```javascript
// Read.
var width = box.offsetWidth;

function resizeAllParagraphsToMatchBlockWidth() {
  for (var i = 0; i < paragraphs.length; i++) {
    // Now write.
    paragraphs[i].style.width = width + 'px';
  }
}
```
如果要保证安全，应当查看 [FastDOM](https://github.com/wilsonpage/fastdom)，它会自动为您批处理读取和写入，应当能防止您意外触发强制同步布局或布局抖动。