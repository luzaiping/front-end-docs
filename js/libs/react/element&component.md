# element & component

## element
element 可以用 jsx 来定义，也可以用 React.createElement() 创建, 优先 jsx。

element 有两种, 一种是直接使用 html tag 定义，比如：

```javascript
let element = <h1>hello {name}</h1>
```
另外一种就是由 component 创建，比如

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>hello {this.props.name}</h1>
  }
}
let element = <Welcome name='world/>
```

实际应用中，大部分都是由 component 创建的得来。自定义的组建必须采用首字母大写来命名。

## component
接收 prop 参数，返回一个element。有2种类型：functoin component 和 class component

```javascript
function Welcome(prop) {
  return <h1>hello {prop.name}</h1>
}
```

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>hello {this.prop.name}</h1>
  }
}
```

简单的component，建议采用 function 形式来定义，通常这种函数是 pure function。

需要用到 lifecycle 或者 定义 state, 就得采用 class 形式定义.

