Hybird app 开发中遇到的问题汇总
===============

1. react-router `<Link>` component 直接嵌套 `<img>`, 会出现只有部分区域可以链接跳转

  解决办法：不要直接嵌套 `<img>`, 在 `<img>` 外面套一个 `<div>`

2. `<img>` 标签的 onClick 无效

  解决办法： 将 img 换成 div, 然后在 div 里设置 background 设置图片.