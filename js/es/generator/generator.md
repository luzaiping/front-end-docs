# generator 和 异步编程

## 基础知识

### 语法

``` javascript
function* foo() {
    yield 1
    yield 2
}
```

上面是一个 generator 函数的定义，从语法上来看，generator 函数跟传统函数有两个明显不一样的地方，首先是 function 后面多个了星号, 另外就是函数内多了个 yield 关键字。

星号，仅仅是用来标识这是个 generator 函数，没有其他作用了；星号可以跟在 function 后面，也可以跟在函数名前面，比如 __function *foo()__，这两种写法都是合法。

yield 是 generator 的关键所在，generator 的特性都是跟 yield 有关。当函数执行遇到 yield 语句时，会把 yield 后面的值传到函数外面，同时函数会暂停执行；等到某个时候 (这个时间点是任意)，外面的控制逻辑恢复函数的执行
(这个时候外面可以选择向 generator 传入值)，函数会从之前暂停的地方继续往下执行；如果再碰到 yield 关键字，就重复上面的过程，直到所有 yield 都执行结束。

以上面的 generator 函数为例，现在来执行这个函数

```javascript
    let iterator = foo()  // line 1
    iterator.next() // line 2   output: { value: 1, done: false }
    iterator.next() // line 3   output: { value: 2, done: false }
    iterator.next() // line 4   output: { value: undefined, done: true }
```

下面来分析下这几行代码都做了些什么：

1. line 1，调用函数(跟传统函数的调用方式一样)，返回一个变量，这边变量名特地叫 iterator，是因为 generator 函数的返回值就是一个 Iterator 对象。generator 函数同外部的交互都是通过这个对象来实现。(如果不清楚 Iterator 是什么，请先熟悉完再回来)

1. line 2，调用 iterator.next() 开始执行函数，执行时遇到第一个 yield 语句，函数暂停住，同时向外传出值, 外部会接收到一个 Object 对象，包含2个属性：value 就是 yield 后面的值(这个例子是一个简单值；如果是表达式，那就是表达式的结果；如果是函数，就是函数的返回值)；done 表示当前 iterator 是否已经迭代结束 (对于 generator函 数来说，表示函数是否执行完成)

1. line 3，启动暂停的 generator 函数，函数从上次暂停的地方(yield 1) 继续往下执行，马上就遇到 yield 2，同 line 2 一样，这边得到一个返回的 Object 对象: { value: 2, done: false }

1. line 4，执行第二个 yield 后的语句，这个例子里 yield 后没有其他语句，但是一样会有返回结果，返回结果是 { done: true, value: undefined }, 其中 done 是 true，表示函数已经执行完成，value 是 undefined，表示没有返回具体的值。

这段代码有几个地方需要注意：

* line 1, 执行 generator 函数的方式是 foo(), 而不是 new foo() 。至于为什么不是用后者，据说后面的原理有点复杂，具体没有研究，如有知道的烦请私U^_^
* line 1, 执行 foo() 后，foo 函数实际还没真正开始执行，这步只是构造了一个 iterator 对象，只有执行了第一个 next()，函数才会真正开始执行 (可以在line 1 前面加个 console 测试下)
* line 3, 注意这边返回结果的 done 还是 false，表示 generator 还没执行完。一个 next() 会执行一个 yield 语句，执行2次 next() 后，已经执行完第二个 yield语句，从函数定义来看后面已经没有其他内容，函数应该是结束才对，即 done 应该是 ture 才合理。但实际这时候 generator 还没真正完成，因为执行第二次 next() 后，只是把第二个 yield 后面的值传到外面去，同时函数进入暂停状态；但是函数还得被恢复执行，而且在恢复执行的时候，外部是可以向 generator 传入值，也就是说还有些事情没有做，所以 done 的值还不能是 true。只有再执行一次 next(), done 才会是 true。从这边可以看出，__要完全执行完一个 generator 函数，所需调用的 next() 次数要比 yield 语句多一次__。

### 特性

从上面的例子可以看到，generator 函数的的返回值是一个 __Iterator__ 对象，通过 Iterator 的第一个 next() 开始执行 generator 函数，遇到 yield 语句，generator 就暂停执行，再调用一次 next() 就会继续执行暂停的函数。

因此可以看出 generator 函数具有这样的特点：

* generator 的执行过程是 执行->暂停->执行 这样的形式; 而传统函数一旦执行就会把整个函数体都执行完。
* generator 可以有多次返回值(其实也可以有多次输入值)；而传统函数只能有一次返回值和一次输入值(函数参数)。
* yield 关键字只有在 generator 函数里才合法，因此暂停是 generator 内部自己控制，函数外无法暂停 generator 的执行；相反暂停后的恢复是由函数外的逻辑控制，generator 无法自己恢复暂停。

### iterator 和 for of

接下来看下 generator 跟 iterator 以及 for of 的关系。先来看一个例子：

``` javascript
function* bar() {
    yield 1
    yield 2
    yield 3
    yield 4
    return 5 // 5 是否像传统函数返回出去被外面接收到呢？
}

let iter = bar()
iter.next() // output { value: 1, done: false}
iter.next() // output { value: 2, done: false}
iter.next() // output { value: 3, done: false}
iter.next() // output { value: 4, done: false}
iter.next()
```

这个例子在 generator 函数的最后增加了一个 return 语句，那么这个 return 的值是否会被外面正常接收到呢？

实际情况是会，也不会，具体要看怎么使用 generator 返回的 iterator 对象。

如果是利用 iterator 的 next 函数来迭代，那么 return  后面的值会被外面正常接收，所以上面的例子，最后会输出 {value: 5, done: true}

如果采用for...of 来处理上面的 iterator 对象：

``` javascript
for (let value of bar()) {
    console.log(value)
}
```

最后只会输出 '1, 2, 3, 4', 5；return 值被丢弃掉了。那是因为 for...of 对Iterator的处理相等于是下面的功能：

```javascript
let iter = bar()
let result = iter.next()
while (!result.done) {
    console.log(result.value)
    result = iter.next()
}
```

只有done为false时，value才会被保留下来。所以如果是要向外传值，尽量不要采用 return 的方式。

### 向generator函数传入值

前面讲的都是 generator 函数向外传值的情形：执行到 yield 语句时，yield 后面的值会传递给外面，外面通过 Iterator 的 next() 得到这个值。

同传统函数一样，我们也可以向 generator 函数传入值，而且可以多次传入值。再来看一个例子

```javascript
function* foo(a = 0) {
    let x = a + (yield 1) // line 1
    let y = x + (yield 2) // line 2
    let z = y + (yield 3) // line 3
    console.log(x, y, z) // line 4
}

let iter = foo(1) // line 5
iter.next(2) // line 6
iter.next(3) // line 7
iter.next(4) // line 8
iter.next(5) // line 9
```

请先思考下 line 4, x, y, z 最后的输出值是什么？

如果能准确给出line4, x, y, z 的值，说明已经熟悉了generator 同外部的双向数据传递方式，那么下面的内容你可以忽略了^_^。如果还不清楚，那就一起来看下上面的代码：

1. 首先 generator 函数定义多了个输入参数 a；line 5，在创建 iterator  对象的时候，传入参数值1，最终参数 a 的值就是1，这个同传统函数是一样。__这是向  generator 函数传入值的一种方式。__

1. line 6 执行 next(2) 就会开始执行 generator 函数，碰到第一个 yield 语句：yield 1， 函数暂停执行，同时将 1 向外传出；因此 line 6 可以获取到结果： {value: 1, done: false}, 这个跟之前是一样的。唯一不同的是 next() 多了个参数值2，这个值在这个例子里并没有任何用处，原因请往下看；

1. line 7 执行next(3), 恢复 generator 函数的执行，并且从上次暂停的地方也就是 (yiled 1) 往下执行。这时候就该执行 let x = a + (yield 1)，这个语句中的 a 的值已经清楚了，但是 (yield 1) 到底是什么呢？为了方便我们将 yield x 称作 __yield 表达式__。或许你应该猜到了，yield 1 这个表达式的结果就是 next(3) 里的参数值3，所以整个语句就等同于 let x = 1 + 3, 即4。next(input) 这是外面向 generator 函数传入值的另一种方式，这个 input 会在函数执行的时候代替 __上次暂停的 yield 表达式__(这边就是 yield 1)。注意是上次的 yield 表达式，现在就可以解释 line 6 调用next(2)，参数值 2 为什么没有任何用处，因为这个 next 只是开始了 generator 函数的执行，在函数暂停前并没有其他的 yield 语句，所以参数值2也就不能代替任何 yield 表达式，传不传这个参数值结果都是一样。

1. line 8 跟 line 7 是一样，传入参数值4，这个值代替line 2 里的 yield 2，所以 y = 4 + 4, 即 8

1. line 9 重复上面的计算过程，最后 z = 8 + 5, 即 13

上面说 next(input) 是代替上次暂停的 yield 表达式，可以换一种方式来理解。input 是上一个暂停的 yield 表达式 的求值结果。以这种方式来理解的话，每一个 yield 表达式首先向外传出一个值，外面接收到这个值后，做一些计算，
然后将计算结果通过 next(input) 的 input 传入进来；所以 yield 表达式 更像是一个求值的请求。而这个恰恰是 generator 的主要用处，后面要讲的异步编程就是基于这个思路。

```javascript
let x = a + (yield 1) // 向外传出值1等待计算完成后再接收结果
// ...
let output = next() // 得到值1
let input = calculate(output.value) // 做一些计算
next(input) // 将结果再传入
```

## generator和异步编程

### 异步编程的实现

讲完了 generator 的基础知识后，来看下 generator 有什么用途。

generator 在实际中的主要应用是异步编程。前面提到程序执行到 yield 语句时，generator 函数会暂停执行，向外传出 yield 后面的值，等到某个时刻，外面再通过 Iterator 的 next 方法将结果传入进来。基于这个思路，
可以在 yield 后面执行异步请求，等异步请求成功后，通过 next 将结果传入进来，这样就可以在 generator 里编写同步风格的代码但最终实现的是异步操作，类似下面这样的代码：

```javascript
function* main() {
    try {
        let result1 = yield asyncRequest(args)
        let data = JSON.parse(result1)
        let result2 = yield asyncRequest(data.id)
        // ...
    } catch (e) {
        // ...
    }
}
```

这边 generator 负责编写应用程序的业务逻辑和错误处理，完全不用关心异步请求 aysncRequest 的实现细节，整个代码风格像同步代码一样简洁，容易理解。想象下如果用 callback 来实现上面这样一个业务逻辑，需要把第二个 asyncRequest 写在第一个 asyncRequest 的callback里，如果是多个这样的请求依赖，就会出现可怕的 callback hell。如果单纯用 Promise 来实现，情况会好一些，不过也会出现多个 then 的链式调用，从代码的编写和可读性来考量，都没有上面这种风格来得直观。

下面来实现一个完整的例子。首先实现一个获取数据的异步请求函数：

```javascript
const data = ['五角大楼', '企业号', '金字塔']

function makeAsyncCall(number, callback) {
    setTimeout(function() {
        callback(data[number % 3])
    }, 1000)
}
```

这边通过调用 setTimeout 来执行异步请求，实际应用中，最常见的就是ajax请求。接下来增加一个 request 的 utils 函数，负责调用 makeAsyncCall

```javascript
function request(number) {
    makeAsyncCall(number, function(result) {
        // 异步请求后的结果，通过iter.next(result) 传给 generator
        iter.next(result)
    })
}
```

这个函数的重点是 makeAsyncCall 的第二个参数 callback：接收到异步请求的结果后，调用 iterator.next(input) 恢复暂定的 generator 函数同时将结果传进去作为上一个 yield 表达式的求值结果

接下来看下负责应用逻辑的 generator 函数(处于简单考虑，这边省略掉对错误的处理)

```javascript
function* main() {
    let result1 = yield request(1)
    console.log(result1)

    let result2 = yield request(2)
    console.log(result2)

    let result3 = yield request(3)
    console.log(result3)
}
```

最后创建 generator 对应的 iterator 并开始执行

```javascript
let iter = main()
iter.next()
```

来分析下，调用 next() 后程序是怎么执行：

1. 首先遇到第一个 yield，这边 yield 后面是 request(1)，是一个函数调用，因此先执行 request 函数，request 函数调用 makeAsyncCall 函数，调用完 makeAsyncCall 函数后 request 函数也结束，这个函数没有返回值，所以等同于是 yield undefined 。之后 genertor 进入暂停状态，等待外部唤醒；

1. 在某个时刻 (注意不是正好1000毫秒后，如有不清楚请查阅浏览器的 __event loop__ 机制)，setTimeout 的 callback 被执行，根据 number 计算得到对应的结果，最后调用 iter.next(result)；这个 result  作为 yield request(1) 的结果赋值给 result1，然后 generator 继续往下执行，直到碰到 yield request(2)

1. yield request(2) 重复 yield request(1) 的过程；yield request(3) 也是一样的过程，就不再赘述。

这个例子出于简单考虑，只实现了一个 request 的异步请求，实际应用中可以是不同的异步请求，也可以是同步请求；当然这个例子还是过于简单了，如果要执行复杂的场景，比如并发执行多个 request，就会受限。接下来用 Promise 来改写下这个例子。

上面那个例子，request 函数没有返回值，最终是 yield undefined。现在改写下 request 函数，要能返回一个 promise 对象，也就是 yield 一个 promise 对象，这样外部程序就可以得到 promise 对象，然后就可以使用 promise 的各种特性了：

```javascript
function request(number) {
    return new Promise(function(resolve) {
        makeAjaxCall(number, resolve)
    })
}
```

现在 request 函数创建并返回一个 promise 对象，这个 promise 会在异步请求成功后 resolve (这边忽略掉 reject 的情形)。上一个例子在异步请求后调用了 iterator 的 next 恢复暂停的 generator，那么现在要怎么恢复暂停的 generator 呢？

我们需要一个utils函数，该函数接收 yield 的 promise 对象，有了promise 对象，就可以得到异步请求结果，然后再结合 iterator 的 next 就可以继续执行 generator 函数：

```javascript
function runGenerator(generator) {
    let iter = generator();

    (function iterate(result) {
        let { done, value } = iter.next(result)
        if (!done) {
            value.then(iterate)
        }
    })()
}
```

来看下现在整个流程是怎么走：

1. 将 generator 函数作为参数传给 runGenerator，执行 runGenerator 后，首先创建 generator 对应的 iterator，然后通过一个立即执行函数执行第一个 next (参数 result 的值是 undefined )。在上一个例子，这2个操作我们是单独执行，这边已经被包含到 utils 函数里；

1. 执行 next后 遇到 yield request(1), 先执行 request 函数，该函数创建并返回一个 promise 对象, generator 进入暂停状态。接着获取 iter.next(result) 返回的结果 {done, value}, 这边的 value 就是传出来的 promise 对象, 如果 done 是 false，表示还没执行结束，通过 promise 的 then 获取异步请求结果；一旦 promise resolve，执行 then 的 callback，即 iterate 函数，iterate 函数的参数 result 就是异步请求的结果；然后 iterate 函数再执行 iter.next()，恢复执行 generator，同时传入异步请求结果

1. 碰到yield request(2), 执行request函数，得到另外一个 promise 对象，等 promise resolve 后，再执行 iterate 函数，直到 done 为 true。

这边 iterate 是一个递归函数，通过 done 的值 让整个 generator 一直执行下去, 直到 done 为 true。

借助这个 utils 函数，整个程序更加简洁，runGenerator 串联起 request 函数 和 generator 函数之间的交互。关键的是异步请求用 Promise 实现了，有了 promise 就可以轻松实现并发请求：

```javascript
function* main() {
    let allResults = yield Promise.all([
        request(1),
        request(2)
    ])

    console.log('allResults', allResults)
}
```

利用 Promise.all() 实现并发请求，参数数组中的每一个元素都调用 request 函数得到对应的 promise，Promise.all() 本身返回的也是Promise，因此 runGenerator 函数无需任何调整。

再增加一点复杂度，request 返回 promise，基于这个 promise 做一些处理

```javascript
function request(number) {
    return new Promise(function(resolve) {
        makeAjaxCall(number, resolve)
    }).then(function(response) {
        return response === '五角大楼' ? request(1) : response
    })
}
```

这边调用 promise 的 then 处理 resolve 后的结果，如果 response 等于特定的值('五角大楼')，那么再请求一次 request (基于前一个请求结果，再请求其他数据)；因为 request(number) 返回的是 promise 对象，所以 then 返回的 promise 会等到
request 返回的 promise resolve 后才会被 resolve；如果不等于 '五角大楼'，就直接返回 response。由于 promise 的 then() 返回的也是 Promise 对象，所以 runGenerator 函数还是可以正常处理，无需改动。

在列举的这些例子里说的都是异步请求，如果是同步请求，要怎么调整呢？

只需修改下 runGenerator 函数即可：

```javascript
function runGenerator(generator) {
    let iter = generator();

    (function iterate(result) {
        let { done, value } = iter.next(result)
        if (!done) {
            if (typeof value === 'object' && 'then' in value) { // value 是 promise 保持原来的处理方式
                value.then(iterate)
            } else {
                iterate(value) // 其他情形 将传出来的 value 再传回去
            }
        }
    })()
}
```

增加了对 value 的判断，如果是 promise，就保持原先的处理方式；否则就将得到的值再回传给 generator。

测下修改后的runGenerator

```javascript
runGenerator(function *main() {
    let result1 = yield request(1)
    console.log(result1)

    let result4 = yield 4
    console.log(result4)

    let allResults = yield Promise.all([
        request(2),
        request(3)
    ])

    console.log('allResults', allResults)
})
```

现在 runGenerator 同步和异步请求都可以处理了，当然这是一个比较粗略的版本，异常的处理都被我们省略掉了。其实已经有开源 library 实现了runGenerator 的功能，比如 Q.spawn(..) 和 co(..)，而且功能更加完善，
这些开源 library 都能很好地将 Promise 和 Generator 结合到一起。

### redux-saga

redux-saga 是 redux 的一个中间件，主要用来处理异步的 action 请求。这个中间件大量地使用了 generator 。来看下一个实际的例子：

```javascript
export function* login(username, password) {
    try {
        let tokens = yield call([ ucService, ucService.login ], username, password)
        yield call(setTokenInfo, tokens)
        yield put({ type: LOGIN.SUCCESS, response: tokens })
        let userInfo = yield call([ ucService, ucService.getUserInfo ], tokens.userId)
        yield call(setUserInfo, userInfo)
        yield put({ type: GET_USER_INFO_SUCCESS, response: userInfo })
    } catch(error) {
        yield put({ type: LOGIN.FAILURE, error })
    }
}
```

这是一个用户登录的场景。接收参数 username 和 password，首先调用 ucService.login 执行异步请求，ucService.login 返回由 fetch 返回的 promise 对象。login 请求成功后，
调用 setTokenInfo 存储请求结果 tokens (这是一个同步操作)；之后发送一个 LOGIN.SUCCESS 的 action 请求，将 tokens 传入 reducer 进行处理；然后调用 ucService.getUserInfo 再异步请求用户信息，
再存储得到的用户信息，最后发送 GET_USER_INFO_SUCCESS action 请求将用户信息传给 reducer 处理。如果中间哪个步骤有错误，就转到 reducer 里对应的 LOGIN.FAILURE 处理。

这个例子跟我们之前的例子很像，也是结合 genertor 和 promise 实现同步风格的异步功能；这边多了错误处理和一些 redux-saga 的 Effects 调用 (call 和 put 函数调用后会返回普通的 object 对象，包含要处理的请求信息，
redux-saga 最终会根据这些信息决定要执行什么操作；redux-saga 将 call 和 put 称作是 Effect，redux-saga 还有很多这样的  Effect)。这个例子里，没有看到类似 runGenerator 这样的工具函数，因为 redux-saga 内部已经封装好了，
而背后的机制跟我们前面介绍的内容是类似。

### async 函数

async 函数是属于ES7的特性，这个代表了异步编程的未来；目前新版的浏览器大多都支持了，nodejs 7.6 以上版本也支持了该特性。来看下采用 async function 改写后的例子：

```javascript
async function main() {
    try {
        let result = await Promise.all([request(1), request(2)])
        return result
    } catch (e) {
        throw Error('出错了!')
    }
}

let promise = main()
promise.then(result => console.log(result)).catch(e => console.error(e))
```

整个代码风格跟 generator 的实现方式很像，关键是不再需要 runGenerator 这样的工具函数了, 直接执行 main() 就可以了。

__注意__ 调用 async 函数返回的是一个 Promise 对象，如果 aysnc 函数有返回值，返回值会被该 Promise 对象 resolve；如果有异常，就是相应 reject; 因此可以利用 Promise 在函数外对返回值进行再处理。

还有 await 后面的内容通常是一个 Promise 对象，而调用 aysnc 函数是返回一个 Promise 对象，因此可以在 async 函数里嵌套 aysnc 函数。从这里可以看出 async 函数跟 Promise 是息息相关；利用这2个特性，就能将原先一些复杂的异步实现，用更加优雅地方式来完成。这边只是简单提下 async 函数，还有很多内容可以展开，有兴趣的同学请自行研究。^_^

## 总结

generator 是 ES6 引入的新特性，跟传统函数主要的区别是 generator 可以暂停 和 恢复执行，可以有多次返回值和输入值。generator 一个主要用途就是结合 Promise 实现同步风格的异步编程，不过需要借助工具函数来完成。generator 初看起来会有些难于理解，其背后的机制主要是 genertor 和 iterator 的双向数据交互方式，因此要先理解透这二者的关系才能更好地掌握它。当然如果是只考虑异步编程实现，未来肯定是优先选择 async 函数，不过理解 generator 的异步实现方式也能加深我们对 async 函数的理解。