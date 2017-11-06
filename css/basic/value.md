# 几种 value 说明

这边解释下 css 涉及到的几个 value 相关的概念，包括 inital value，specified value, computed value, used value, actual value.

## initial value

这个就是css property 的默认值，根据 property 是否可以继承又有不同的使用情况：

+ 如果是 inherited property, initial value 只对 root element 有效，只要没有指定 specified value.
+ 如果是 non-inheried property, initial value 对所有 element 都有效，只要没有指定 specified value.

## specified value

一个给定 property 的 specified value 按照下面三条规则的顺序决定

1. 如果样式里显示设定了该 property 的值，那么这个设定的值就会作为该 property 的 specified value;

1. 如果样式里没有设定该 property 的值，但是这个 property 是 inherited property，那么它的 specified value 就会从父元素那边 获取得到(root element 除外);

1. 如果不属于上面两种情况，那么就使用该 property 的 initial value 作为 specified value.

## computed value

一个 property 的 computed value 是指通过继承由父元素传递给子元素的值。通常是指将相对值转换成绝对值。比如一个元素的 font-size 是 16px， padding-right 是 2em，那么 padding-right 的
computed value 就是 32px。

## used value

一个 css property 的 used value 是指对 computed value 进行所有计算后得到的值

## actual value

一个 css property 的 actual value 就是 used value 被应用后的近似值.

## final value 的计算过程

浏览器(user agent) 通过4个步骤来计算一个 property 的最终值

1. specified value 基于 cascade, inheritance 或者 initial value 确定

1. 根据规范计算 calculated value (比如一个 span 被设置成 position: absolute, 那么它的 display property 对应的 computed value 就会从 inline 变成 block)

1. 然后 layout is calculated, 得到 used value.(比如一个元素的 width 被设置成对应 containing block 的百分比，这个 width 的值就得等到 containing block 被确定好了才能知道). used value 就是基于 computed value 然后解析剩余的依赖，将值转换成绝对值的结果

1. 最后 used value 根据使用环境的限制被转换形成 actual value