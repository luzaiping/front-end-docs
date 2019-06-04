# flexbox

## container

### flex-direction

决定 main-axis 和 cross-axis 的方向:

+ row
+ row-reverse
+ column
+ column-reverse


### flex-wrap

+ wrap
+ nowrap

### flex-flow

shorthand for flew-direction and flex-wrap

```css
.box {
  display: flex;
  flex-flow: row-reverse wrap;
}
```

## flex-item

### flex-basis

definition: what is the size of the item before growing and shrinking happens?

default value is auto. if items have size, of example 100px, the felx-basis: auto, means 100px for each item.

if items have not size, the content's size is used as flex-basis (内容大小就是最终的 flex-basis)

flex-basis: 0, completely ignore the size of the item when doing space distribution.

### flex-grow

how much of the positive free space does this item get?

决定 item 要以多大的比率占用剩下的space, 如果每个item 的 flex-grow 是一样大，那么就平均分配

### flex-shrink

how much of the negative free space can be removed from this item?

当 items 的大小超过 container, 导致 overflow, 这个属性指定当前 item 相比其他 item 需要 shrink 多少比率的空间，以确保不会 items 的总大小等于container

### flex

shorthand for  flex-grow  flex-shrink  flex-basis


## align, justify, 

### align-items

定义在 container 上，控制 items 在 cross-axis 上是怎么排列：

+ stretch        默认值, item 在 cross axis 上完全伸展开，也就是完全占用 cross-axis
+ flex-start     在 cross axis  的 start 上对齐
+ flex-end       在 cross axis  的 end 上对齐
+ center         居中对齐
+ baseline       

### align-self

设置单个 item 在 cross-axis 上的对齐方式， 属性值跟 align-items 的是一样。区别是 align-items 是定义在 container 上面，配置是对所有 items 起作用; align-self 定义在 item 上，会覆盖 align-items 的设置，只对当前 item 有效。

### align-content

当 cross-axis 上有足够空间, 决定 items 是要如何分配这些多出来的空间, 类似 justify, 区别是在 cross-axis 上对 items 进行排列

### justify-content

当 cross-axis 上有足够空间, 决定 items 是要如何分配这些多出来的空间, 类似 align-items, 区别是在 cross-axis 上对 items 进行排列

定义在 container 上，控制 items 在 main-axis 上是怎么排列：

+ flex-start:  默认值, 对齐 start
+ flex-end:    对齐 end
+ center:      居中对齐
+ space-around: 每个 item 两边占用的空白大小是一样多， 也就是 2个 item 占用的空白是单独一边的2倍
+ space-between: item 和 item 之间的空白是一样多, 也就是前后2个item会紧贴 start 和 end
+ space-evenly: item 两边 以及 item 和 item 之间的空白是一样多


### order

设置在 item 上面, 默认 order 的值是 0, 值越大排越后面，相同值的2个item，按在 document 的出现顺序，谁在前就排前面。