// function isObj(obj) {}

// function extend(target, obj) {
//   for (let key in Object.keys(obj)) {
//     if (target[key] && isObj(obj[key])) {
//       extend(target[key], oj[key])
//     } else {
//       target[key] = obj[key];
//     }
//   }
// }

/* run(
  next => {
    setTimeout(() => { 
      console.log(1)
      next()
    }, 1000) 
  },
  next => {
    console.log(2) 
    next()
  }, 
  next => {
    console.log(3)
    next()
  }
) */

/* function run(...fns) {
  let dispatch = index => {
    if (index === fns.length) return;
    const fn = fns[index];
    return fn(() => dispatch(index + 1))
  }
  dispatch(0);
} */


/* function run(...fns) {
  let dispath = index => {
    if (index === fns.length) return;
    let fn = fns[index]
    return fn(() => dispath(index + 1))
  }
  dispath(0)
} */

/* const mySetTimeout = (callback, time) => {
  const timer = setInterval(() => {
    clearInterval(timer);
    callback();
  }, time);
};

mySetTimeout(() => {
  console.log('mySetTimeout');
}, 500); */

/* const mySetInterval = (callback, delay) => {
  (function inner() {
    const timerId = setTimeout(() => {
      clearTimeout(timerId);
      callback();
      inner();
    }, delay);
  }());
}; */

/* function mySetInterval(callback, delay) {
  const fn = () => {
    const timerId = setTimeout(() => {
      callback();
      clearTimeout(timerId);
      fn();
    }, delay);
  }
  fn();
}

mySetInterval(() => {
  console.log('mySetInterval')
}, 1000); */

// ES3 写法
// Function.prototype.callSimulator = function (context) {
//   let finalContext = context || globalThis;
//   finalContext.fn = this;

//   let args = [];
//   const length = arguments.length;
//   for (let i = 1; i < length; i++) {
//     // args.push(arguments[i]);
//     args.push('arguments[' + i + ']');
//   }

//   let result = eval('finalContext.fn(' + args + ')');
//   delete finalContext.fn;
//   return result;
// }

// ES6 写法
Function.prototype.callSimulator = function (context, ...rest) {
  let finalContext = context || globalThis;
  finalContext.fn = this;
  let result = finalContext.fn(...rest);
  delete finalContext.fn;
  return result;
}

Function.prototype.applySimulator = function(context, arg) {
  let finalContext = context || window;
  finalContext.fn = this;

  let result;
  if (!arg) {
    result = finalContext.fn(); // 没有参数，就直接执行函数
  } else {
    var length = arg.length;
    let args = [];
    for (let i = 0 ; i < length; i++) {
      args.push('arguments[' + i + ']');
    }
    eval('finalContext.fn(' + args + ')');
  }

  delete finalContext.fn;
  return result;
}


// 测试一下
var value = 2;

var obj = {
    value: 1
}

function bar(name, age) {
    console.log(this.value);
    return {
        value: this.value,
        name: name,
        age: age
    }
}

// bar.callSimulator(null); // 2

console.log(bar.callSimulator(obj, 'kevin', 19));




