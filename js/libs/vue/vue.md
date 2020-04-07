vue
=================================================
这个文档主要描述 vuejs 特有的功能以及较难理解的特性

## 指令

## vue 实例

```js
var vm = new Vue({
  // options
})
```
vm 是一个 Vue 实列。通常一个 Vue 应用由一个根 Vue 实例，以及可选的嵌套的、可复用的组件树组成。

根实例
└─ TodoList
   ├─ TodoItem
   │  ├─ DeleteTodoButton
   │  └─ EditTodoButton
   └─ TodoListFooter
      ├─ ClearTodosButton
      └─ TodoListStatistics

这边每个Vue组件都是Vue实例，都接收同样的选项 (有几个选项是根实例才有)

__注意:__ Vue 组件结构跟 React 类似，也是由组件树形成。

### 数据 与 方法

在创建 Vue 实例的时候，Vue 会将 data 对象中所有的属性加入到 Vue 的响应式系统中(具体原理还需进一步探索). 修改 data 中的数据，会引起 view 更新。

可以通过 vm.$data 访问options里的 data 信息；同理也可以通过 vm.$el, vm.$watch 访问其他实例属性或者方法。

这块内容是属于 Vue 特有的功能。

```js
var data = { a: 1 };
var vm = new Vue({
  el: '#example',
  data: data
});

vm.$data = data; // true
vm.$el = document.getElementById('example'); // true
vm.$watch('a', function(newValue, oldValue) {
  // 这个回调会在 `vm.a` 改变后被调用
})
```

__备注__ 实例的属性和方法可以参考具体的 API 文档

### 生命周期

类似 React 的生命周期函数，Vue 也有一组生命周期的 hook，这些 hook 会在特定的时期被执行，具体参考官方文档。

每个生命周期 hook 是作为创建 Vue 实例的选项来定义。

__备注__ options 包含了很多信息，具体可以参考 API 文档。这些 options 用于决定一个vue实例的功能。


## 模板

Vue 使用基于 HTML 的模板语法，也可以直接写 render 函数 或者 使用可选的 JSX 语法来代替。

在底层实现上，Vue 将模板编译成虚拟 DOM 渲染函数。结合响应式系统，Vue 能够智能地计算出最少需要重新渲染多少组件，并把 DOM 操作次数减少到最少。

### 插值 (Interpolations)

#### 文本
类似 React，使用双大括号来引用数据
```html
<span>Message: {{ msg }}</span>
```
这边 msg 会引用 data.msg

#### html 文本
如果要显示 html 内容，需要借助 vue 指令
```html
<p>Using mustaches: {{ rawHtml }}</p>
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```
上面第一行会将 html 内容都显示出来(也就是html 标签都会被组成显示出来)；第二行会以 html 显示内容。

#### 属性

这种情形就得使用 `v-bind` 来引用 data 里的数据，而不能像 React 还是直接使用双大括号的形式。

```html
<div v-bind:id="dynamicId"></div>
```
这样就实现 view 和 model 的绑定

### 指令

指令 (Directives) 是带有 `v-` 前缀的特殊 attribute。通常 attribute 值是单个 js 表达式。指令的职责是，当表达式的值发生改变时，将其产生的连带影响，响应式地作用于 DOM。

#### 指令参数

一些指令还可以接收一个 参数, 在指令名称之后以冒号表示。比如

```html
<a v-bind:href="url">...</a>
```
这个例子里 href 就是参数，告知 v-bind 指令将该元素的 href attribute 与表达式 url 的值绑定。

#### 动态参数

v2.6.0 开始，可以用 `[]` 括起来的 js 表达式作为一个指令的参数：

```html
<a v-bind:[attributeName]="url">...</a>
```
这边的 attributeName 会被作为一个 js 表达式进行动态求值，值的结果作为最终的参数使用。

#### 修饰符

修饰符(modifier) 是以半角句号 `.` 指明的特殊后缀，用于指出一个指令应该以特殊的方式绑定。比如，`.prevent` 修饰符告诉 v-on 指令对于触发的事件调用 `event.preventDefault()`:

```html
<form v-on:submit.prevent="onSubmit">...</form>
```

#### 缩写

+ `v-bind` 缩写，可以直接去掉 v-bind, 比如 <a v-bind:href="url">...</a> 可以缩写成 <a :href="url">...</a>
+ `v-on` 缩写，`v-on` 可以用 `@` 代替, <a v-on:click="dosomething">...</a> 可以缩写成 <a @:click="dosomething">...</a>

## 组件

组件本质上就是一个 Vue 实例，接收一组类似根实例的 options

### 注册方式

组件的注册(创建)方式有两种，分为 全局 和 局部

全局：
```js
Vue.component('my-component-name', {

})
```
局部：
```js
var ComponentA = {
  /* .. */
}
var vm = new Vue({
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB,
  }
})
```

### data 属性

同根实例不同，组件的 data 属性必须是一个函数
```js
Vue.component('my-component-name', {
  data: function() {
    return {
      count: 0
    }
  }
})
```
这是为了确保每个组件实例可以维护一份被返回对象(data)的独立拷贝，即返回单独的一份 data，从而不会导致多个实例的数据互相影响。

### props

同 React 一样，Vue 组件也接收一个 props 属性，这个用于父组件像子组件传递数据。相比 React，Vue 的 props 数据类似比较丰富，同时可以直接在 props 里指定传递的数据类型和默认值等信息。

但是 Vue 的 props 貌似不能接收函数？

### 监听子组件事件

这个功能是给子组件添加监听事件，由子组件进行事件触发，类似于 React 将 handler 作为 props 传递给 子组件，由子组件触发这个 handler
```js
// 父组件
<blog-post
  v-on:enlarge-text="postFontSize += 0.1"
></blog-post>

// blog-post 组件
<button v-on:click="$emit('enlarge-text')">
  Enlarge text
</button>
```
通过 v-on 给子组件添加 `enlarge-text` 事件，在子组件里通过 `$emit('enlarge-text')` 触发事件

__备注__ 按照目前这种机制，事件名称在父子组件里明显耦合了，应该是个人理解不到位，后续再关注下这块。
__注意__ 在这个例子里 v-on 注册事件的内容是直接把函数体内容写进去了，React 只接收函数名称 或者 一个完整的函数，Vue 的这种用法还真是奇特，这种用法对于简单的函数体倒是合适，复杂的就不行了。