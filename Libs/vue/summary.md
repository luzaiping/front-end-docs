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

## v-for

这个指令用于渲染列表，类似于 React，也建议给每个 item 设置一个 key；下面罗列这个指令跟 React 在用法上的一些差异：

+ React 用于获取 item 和 index 的用法，其实就是 Array map 函数的写法； 而 v-for 的用法是 `item in items`，其中 items 是 data 定义的属性，而 item 是临时变量，如果要获取 index，则需要写成 `(item, index) in items`
+ v-for 除了应用在 array 上，也可以用在 object 和 数字，比如 `(value, key, index) in obj`, `n in 10`
+ 元素变更触发 re-render 的机制不一样；vue 是通过对 data 属性 set 方法的监听实现数据变更触发 render，因此需要直接修改属性值，所以直接调用一些会改变数组的方法：splice，push, shift 就可以触发 re-render；而类似 filter，map 会返回一个新函数的方法，则需要将返回值再赋值给属性值才能触发 re-render；相反 React 采用的策略是比较前后引用值，只有前后值不一样才会重新渲染，如果直接对数组调用 splice，push 等方法，并不会改变值的引用(虽然值发生了变化)，也就不会触发re-render；而是要使用 map, filter 等返回新引用值的方法，重新设置新返回值，才能触发 re-render

## event

Vue 提供的事件功能要比 React 更丰富，写法也更多：
1. React绑定的事件属性值必须是一个函数；而 Vue 即可以是函数，也可以是语句，尤其是语句这种写法，方便直接将参数写在属性值的地方，而 React 如果要传参数，必须在外面再包含一层函数；
1. Vue 支持 modifiers 特性，比如 `prevent, stop, capture, passive, once`，只要将 modifiers 紧跟在 argument 后面即可。另外 modifier 也可以组合。另外 modifiers 还可以是键盘按键、鼠标方向键、系统按键 (ctrl, shift, alt)

下面针对第一点举个列子

```html
<!-- 属性值直接写成语句形式，如果需要传参数，就像正常语句写法即可
    如果需要在事件处理函数中使用 event，需要以 $event 特殊变量作为参数传入
 -->
<div @click.prevent="say('hi', $event)">  
```

```jsx
// 这边需要将语句在包含到函数中，即 React 的事件处理属性值必须是一个函数的引用
// 而不能是一个调用语句的写法
<div onClick={() => { say('hi')}}>
```

## form / v-model

`v-model` 是专门用于处理表单元素，对于各种类型的 form 元素，比如 input，checkbox， radio，select 都适用，它实现了数据双向绑定功能。

## 组件注册

### 全局注册

全局注册要使用 Vue.component:

`Vue.component('component-name', config)`, 组件名称建议都采用 `kebab-case` 格式(小写加'-'的格式)，不推荐使用 camelCase 驼峰格式。

全局注册适用于注册基础组件，这样就无需在每个组件中再次引入组件, 当然这个注册步骤要在 Vue instance 创建之前。

### 局部注册

应用中大部分组件都是采用局部注册的方式，这个使用方法跟 React 类似，通过 ES Module 的方式导入组件；不同的是: 导入组件后，Vue 还需要通过 components 注册组件，而 React 是可以直接使用

```js
import TodoItem from 'someplace/todoItem';
import TodoHeader from 'someplace/todoHeader';

var app = new Vue({
  el: "#app",
  components: {
    //本地注册组件，需要在使用者组件中通过 components 引用
    "todo-item": TodoItem,
    "todo-header": TodoHeader
  }
});
```

## props

同组件名称一样，prop name 也是建议采用 `kebab-case`。

### Prop Types

props 的值有两种形式：

1. 数组，比如 `props: ['title', 'likes', 'isPublished', 'commentIds', 'author']`, 这种形式只定义了要接收哪些 props 
2. 对象，`props: { title: String, likes: Number, isPublished: Boolean, commentIds: Array, author: Object, callback: Function, contactsPromise: Promise }`, 这种形式除了指定要接收props 的 name，同时指定每个 name 的类型

### 校验

针对props值是对象的情形，可以进一步扩展，从而支持对 prop 的校验 (类似于 React prop-types 功能):

```js
Vue.component('my-component', {
    props: {
        propA: Number, // 只指定了 prop 的类型, 类似于 PropTypes.number
        propB: [String, Number], // 支持多种类型， 类似于 PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        propC: { // 这个类似于 PropTypes.string.isRequired, Vue 需要通过 object 形式来表示
            type: string,
            required: true
        },
        propD: { // 这个是 React propTypes 和 defaultProps 的组合，指定了类型又指定了默认值
            type: Number,
            default: 100
        },
        propE: { // 如果是要对 Object 或者 Array 指定默认值，必须使用 factory function
            type: Object,
            default: function() {
                return { message: 'Hello' };
            }
        },
        propF: { // 支持自定义校验函数，这种方式应该是最强大，可以整个应用定义通用的校验函数，这边再引用对应的校验函数
            validator: function(value) {
                // The value must match one of these strings
                return ['success', 'warning', 'danger'].indexOf(value) !== -1
            }
        }
    }
})
```

从上面的内容来看， Vue 提供的 props 校验功能要比 React prop-types 强大得多，不光支持定义 prop type 和 是否必须，还支持定义默认值，；另外还支持自定义校验函数。唯一有点不好的地方就是语法相对复杂点，需要通过实践多加练习掌握。