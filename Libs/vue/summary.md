summary
========================

## data, watch, computed

这三个都可以用来定义数据，以下是它们的区别：

+ data 的属性值通常是非函数的值，比如 primitive, object, array; 当 vue instance 创建成功后，每个属性都会作为 vue instance 的属性。
+ watch 的 property 是 data 中的某一个，对应的 property value 是 function。这个通常用来 watch 某个 property，一旦 property 发生变化后要做哪些操作，比如 ajax 请求之类的复杂操作。
+ computed 是通常是基于 data 属性计算一个新的 属性值，这个属性不能跟 data 中已有的属性名称冲突；如果属性值是 function，那么对应的就是 属性的 get 函数；如果是对象，那么对象属性只能是 get 或者 set，属性值是函数。computed 通常用来基于某个 data property 计算出另外一个值。
