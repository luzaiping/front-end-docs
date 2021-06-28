vuex
================

## state

组件获取 state 状态值的方式：

1. store.state.count: 要求显式 import store, 不推荐使用
1. this.$store.state.count:  要求 Vue.use(Vuex), 同时将 store 作为 new Vue(option) 中 option 的一部分传入，这个比较适合只需获取单个 state 值
1. mapState: 适合需要使用多个 state 值的情形，将 mapState helper 获取到的值作为 computed 的一部分

```js
export default {
  computed: {
    count: store.state.count,  // 方式1 直接使用 store 访问，需要先 import store，不推荐
    count2: this.$store.state.count, // 方式2 如果只有少量这种数据，优先选择这种
    ...mapState({ // 方式3 当需要获取多个 state 中的数据，建议使用这种方式，通过 ... 将 state 数据跟其他 computed 合并到一起
      count: state => state.count,
      countAlias: 'count',
      countPlusLocalState(state) {
        return state.count + this.localState;
      }
    })
  }
}
```

__注意__: 如果是 module 模式，mapState 不能直接使用数组形式，这种形式无法获取到对应的值，必须使用 function，明确指定 module 才行

```js
export default {
  computed: {
    ...mapState['foo', 'bar', 'baz'],  // 对应的是 this.$store.state.foo，因此一旦有 module，就会出现获取不到值的问题
    ...mapState({
      foo: state => state.moduleName.foo; // 这样才能获取到，这种获取方式过于麻烦，因此不常用；还是推荐使用 mapGetters
    })
  }
}
```

## Getters

getters 相当于是对 state 中的数据进行 computed，在 store 中定义，同 state 一样，也有三种获取值的方式

1. store.getters.doneTodosCount
1. this.$store.getters.doneTodosCount
1. mapGetters

使用 getters，一定要在对应 module store 上定义 getters，不然会获取不到值：

```js
export default {
  computed: {
    ...mapGetters(['articlesCount', 'articles', 'isLoading'])
  }
}
```

__注意__: 

+ 不同于 mapState, mapGetters 可以自动处理 module
+ 如果两个 module 定义了一样的 getters，那么定义在 modules 中的位置越靠前，优先级越高；当然出现这种情形，vuex 会报错提醒，应该避免重复的 getters