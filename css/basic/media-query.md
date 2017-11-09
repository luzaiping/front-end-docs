# media query

这篇主要讲解 media query 的作用，语法，使用方法，以及相关的 viewport 概念

## media query 使用方式

media query 总共有 __三__ 种使用，分别是：

1. html link 标签

1. @import At rule

1. @media At rule

下面分别讲解这三种使用方式的具体用法

### @media At rule

这是 media query 最常用的一种方式，@media 可以出现在 styles 文件的顶层位置(跟id，tag，class，selector 这些同级)，也可以嵌套在其他 conditional group at-rule.

```css
@media screen and (min-width: 900px) {
    article {
        padding: 1rem 3rem
    }
}

/* nested media query */
@supports (display: flex) {
    @media screen and (min-width: 900px) {
        article {
            display: flex;
        }
    }
}
```

这种方式比较灵活，可以在一个css文件里定义多个 @media，每一个 @media 可以有不同或者相同的 media type 和 matched media feature 定义。

### html link 标签

可以在 link 标签里指定 media query，只有满足该 media query 后，对应的 css 文件才会被应用

```html
<link rel='stylesheet' media='screen and (min-width: 900px)' href='widescreen-styles.css'/>
```

通过这种方式定义后，widescreen-styles.css 里的 css 内容只有在 media type 是 screen 并且 viewport 的最小宽度是 900px 的情况下才会被应用。不过需要注意的是，该 css 一定会被浏览器 download 下来。如果满足该 media query result，那么浏览器会在 render page 前就 download css 文件，如果不满足，那么 download 操作会被 deferred，这是为了提升首次加载速度的做法，避免不必要的http request。

### @import At rule

先看下用法：

```css
@import url("fineprint.css") print;
@import url("bluish.css") projection, tv;
@import 'custom.css';
@import url("chrome://communicator/skin/");
@import "common.css" screen, projection;
@import url('landscape.css') screen and (orientation:landscape);
```

@import 后面跟上要导入的 css 文件 url 或者 文件名称， 再跟上可选的一个或多个的 media query。

@import 需要定义在 css 文件的前面 (在其他具体的样式定义前)

这种方式定义会引入额外的 http request 请求，因为每一次 import，都是引用一个新的 css 文件，就需要 download 对应的文件，从性能来说，这种方式并不理想；因此这种使用方式最不常见。

## media query 的语法

这边以 @media 这种使用方式来说明 media query 语法。

### 基本语法

一个 media query 包含 两部分： media type 和 media feature. 语法形式：

@media [mediaType and] (media feature) {}, 其他 [mediaType and] 这部分是可选

media type 表示一个给定设备的类型，常见的类型有 screen 和 print；media type 是可选，如果不写就是all，也就是对所有 device 都起作用；多个 type 用逗号分隔开：

```css
@media screen {}
@media screen, print {}
```

media feature 用于描述 user agent (最常见的就是browser)，output device，environment 的特性，比如 device 的 viewport width，device 是否使用鼠标，device 使用的光线情况，
media feature 通常是一个表达式，只有当这个表达式返回 true 时，对应的 css style 才会被应用。

```css
@media (hover: hover) {}
```

这个例子表示只有 device 的主要输入设备 (比如鼠标) 可以 hover over elements 时，对应的 styles 才会被应用。

```css
@media screen and (max-width: 1200px) {}
```

这个例子表示只有运行在 screen 的设备上 并且 viewport 宽度不大于 1200px 时，后面定义的样式会被使用

### 逻辑关键词 和 多个media query

可以通过逻辑关键词 and, not, only 以及 逗号，来组成复杂的 media query

#### and 操作符

如果有 media type，那么后面必须跟上 and 串起 media feature。and 还可以 串起多个 media feature，这样只有所有 media feature 都满足条件后，对应的样式才能被使用

```css
@media (min-width: 30em) and (orientation: landscape) { ... }
@media screen and (min-width: 30em) and (orientation: landscape) { ...  }
```

这个用法跟编程语言里的 && 操作符类似，很好理解

#### 逗号分隔的 media query list

可以将多个 media query 用逗号分隔连接起来，只要有一个 media query 满足，那么样式就会被使用，这个语法类似 多个 class 或者 tag 共用一组样式的写法：

```css
@media (min-height: 680px), screen and (orientation: portrait) { ... }
```

这个例子，如果device 的viewport 高度不小于680 或者 是 screen 的 media type 并且是 竖屏，那么样式就被应用，只要满足其中一个 media query 即可

#### not 操作符

not 就是对现有的 media query 取相反结果，这个也很好理解，不过有一定需要注意，那就是 nor 是对一整个 media query 取反，而不是对 media type 或 media feature 单独取反

```css
@media not all and (monochrome) { ... }
```

上面这个相当于下面这个：

```css
@media not (all and (monochrome)) { ... }
```

再看一个例子

```css
@media not screen and (color), print and (color) { ... }
@media (not (screen and (color))), print and (color) { ... }
```

这2个是等价

#### only

only 关键词是用于阻止不支持 media query 的旧浏览器应用给定的样式，对于支持 media query 的浏览器没有作用

```html
<link rel="stylesheet" media="only screen and (color)" href="modern-styles.css" />
```