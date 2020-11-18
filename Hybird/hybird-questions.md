Hybird app 开发中遇到的问题汇总
===============

1. react-router `<Link>` component 直接嵌套 `<img>`, 会出现只有部分区域可以链接跳转

  解决办法：不要直接嵌套 `<img>`, 在 `<img>` 外面套一个 `<div>`

2. `<img>` 标签的 onClick 无效

  解决办法： 将 img 换成 div, 然后在 div 里设置 background 设置图片. 或者跟上面一样做法，在外层包一个 div

3. safari 10/11 bug

safari 10/11 有2个特别的bug：

+ loop 循环: 如果 变量名称 跟 参数名称一样，会报错
+ await: 不能使用 !await, 否则会报错

webpack TerserPlugin 可以针对该问题对 build 后的代码进行处理：

```js
optimization: {
  minimizer: [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        safari10: true // 这个可以解决 safari 10/11 关于 loop 和 await 的 bug // 具体参考 https://github.com/terser/terser#minify-options
      }
    })
  ]
}
```

4. 弹窗滚动穿透问题

使用 `tua-body-scroll-lock` 这个 lib, 实现一个 自定义 hook，该 hook 接收一个 targetElement

```ts
import { useEffect } from 'react';
import { lock, unlock } from 'tua-body-scroll-lock';

export default function useScrollLock(targetElement: HTMLElement | null): void {
  useEffect(() => {
    // 获取需要滚动的元素
    if (targetElement) {
      // 禁用 body 滚动
      lock(targetElement);
      // 要去除这个属性，不然 android 背景会变成灰色，挡住了后面的内容
      document.documentElement.style.removeProperty('overflow');
    }

    return (): void => {
      // 卸载组件启用 body 滚动
      targetElement && unlock(targetElement);
    };
  }, [targetElement]);
}

// 调用代码

import useScrollLock from '@pmall/hooks/useScrollLock';

const rootRef = useRef(null);
useScrollLock(rootRef.current);
```