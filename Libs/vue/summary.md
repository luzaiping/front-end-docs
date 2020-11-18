summary
========================

## data, watch, computed

这三个都可以用来定义数据，以下是它们的区别：

+ data 的属性值通常是非函数的值，比如 primitive, object, array; 当 vue instance 创建成功后，每个属性都会作为 vue instance 的属性。
+ watch 的 property 是 data 中的某一个，对应的 property value 是 function。这个通常用来 watch 某个 property，一旦 property 发生变化后要做哪些操作，比如 ajax 请求之类的复杂操作。
+ computed 是通常是基于 data 属性计算一个新的 属性值，这个属性不能跟 data 中已有的属性名称冲突；如果属性值是 function，那么对应的就是 属性的 get 函数；如果是对象，那么对象属性只能是 get 或者 set，属性值是函数。computed 通常用来基于某个 data property 计算出另外一个值。

## v-if vs v-show

这两个都可以用于条件控制内容的显示/隐藏，主要区别如下：
+ v-if 类似于 React 的条件渲染，如果条件为 false，那么最终内容是不会渲染到 DOM 里，只有条件为 true，内容才会渲染 (可能是简单的 html 元素，也可能是组件，如果是组件，就相当于组件会走一遍渲染流程)，即内容渲染是 惰性，只有条件为真，才会真正渲染
+ v-show 类似于 React 通过变量(比如 isVisible) 控制 class 或者 style 的 display 属性值 (隐藏的话，就是 display: none); 这种方式条件后面的内容始终是存在于 DOM 中，只是通过 css 切换显隐。
+ Vue 官方对于这两者的描述是，如果是频繁地切换内容显隐，应该使用 v-show，如果在运行时条件很少改变，就用 v-if，因为初始渲染开销可能比较少。