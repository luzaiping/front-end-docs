viewport 相关知识
===================

## viewport Meta tag

html 中可以通过 meta 标签指定 viewport 相关属性值：

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

+ width：指定 visual viewport 的宽度, 通常会将值设置为 device-width, 也就是让页面宽度跟设备宽度一样大
+ height: 指定 visual viewport 的高度，比较少用
+ initial-scale: the initial zoom when visiting the page. 1 表示没有 zoom. 通常会将这个值设置为 1/window.devicePixelRatio
+ minimum-scale: 允许缩放的最小 zomm level
+ maximum-scale: 允许放大的最大 zoom level
+ user-scalable: 是否允许用户进行缩放页面
