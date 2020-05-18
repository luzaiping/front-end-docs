/**
 * js 轮子示例
 */

/**
 * 实现一个 instanceof, 实现思路：
 * 1. 获取 constructorFn 的 prototype
 * 2. 获取 obj 的 prototype 对象
 * 3. 如果 obj 的第一层 prototype 对象不存在, 直接返回 false
 *    或者递归比较 obj 原型链上的对象，如果某一个对象等于构造函数的 prototype，那就返回 true
 * @param {Obj} obj 要检测的对象实例
 * @param {Function} constructorFn 要检测的构造函数
 */
function instanceOfSimulator(obj, constructorFn) {
  const targetProto = constructorFn.prototype;
  let objProto = Object.getPrototypeOf(obj);

  while (true) {
    if (objProto === null) return false;

    if (objProto === targetProto) {
      return true;
    }
    objProto = Object.getPrototypeOf(objProto);
  }
}

/**
 * 基于原型继承的实现方式，这边实现 组合继承 和 寄生组合式继承
 */
function prototypeExtends() {
  function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
  }

  Parent.prototype.getName = function () {
    console.log(this.name);
  };

  function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
  }

  // 组合继承
  // 最大缺点，调用了两次父函数
  function composition() {
    Child.prototype = new Parent(); // 这边调用了一次父构造函数
    const child = new Child('Felix'); // 这边又调用了一次
    console.log(child);
  }

  // 寄生组合继承，要解决组合继承调用两次父构造函数的问题
  // 要去掉的是 Child.prototype = new Parent() 这次调用
  // 看下面的实现
  function parasiticComposition() {
    const F = function () {}; // 定义一个空函数
    F.prototype = Parent.prototype; // 空函数的原型属性指向Parent的原型属性
    Child.prototype = new F(); // Child 的原型属性 指向 空函数的实例，这样就可以避开调用 Parent()
  }

  // 封装一个继承的方法
  function inherit(child, parent) {
    var F = function () {};
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child; // 设置下原型的 constructor
    child.superproto = parent.prototype; // 这个是可选
    return child;
  }
}

/**
 * 模拟 new 的实现，要实现下面四点：
 * 1. 创建一个新的对象
 * 2. 设置对象的原型：如果构造函数的 prototype 是对象类型，就取构造函数的 prototype，否则取 Object.prototype
 * 3. 执行构造函数，并设置函数里的 this 为新对象
 * 4. 处理返回值：如果构造函数的返回值是对象类型就取返回值，否则取新创建的对象
 * 如果允许用 ES 语法，那函数参数可以写成 (Constructor, ...rest)；这样函数内部就不需要处理构造函数 和 参数了。
 */
function newSimulator() {
  const obj = {}; // 第一步
  const Constructor = [].shift.call(arguments); // 这边会修改 arguments
  const targetPrototype =
    typeof Constructor.prototype === 'object'
      ? Constructor.prototype
      : Object.prototype;
  Object.setPrototypeOf(obj, targetPrototype); // 第二步

  const result = Constructor.apply(obj, arguments); // 第三步，这边的 arguments 已经被修改了，只剩下纯参数，而没有构造函数了
  return typeof result === 'object' ? result : obj; // 第四步
}

let ClassSimulator = (function () {
  // 1 类定义不可被提升
  'use strict'; // 2 内部默认都是严格模式
  const ClassSimulator = function (name) {
    // 6. 类名在类内部是不可以被覆盖
    if (typeof new.target === 'undefined') {
      // 3. 必须使用 new 调用 class
      throw new Error('必须使用 new 调用class');
    }
    this.name = name;
  };

  Object.defineProperty(ClassSimulator.prototype, 'sayName', {
    value: function () {
      if (typeof new.target !== 'undefined') {
        // 4. 不能用 new 调用 类的实例方法
        throw new Error('类方法不可以使用 new 的方式调用');
      }
      console.log(this.name);
    },
    enumerable: false, // 5. 原型方法是不可枚举
    writable: true,
    configurable: true,
  });
})();

// 用 setInterval 实现 setTimeout
// 核心是及时清除 timeout
function mySetTimeout(callback, delay) {
  const timerId = setInterval(() => {
    clearInterval(timerId);
    callback();
  }, delay);
}

// 用 setTimeout 实现 setInterval
// 核心是 递归调用
const mySetInterval = (callback, delay) => {
  (function inner() {
    const timerId = setTimeout(() => {
      clearTimeout(timerId);
      callback();
      inner();
    }, delay);
  })();
};

// ES3 写法
Function.prototype.callSimulator = function (context) {
  let finalContext = context || window;
  finalContext.fn = this;

  let args = [];
  const length = arguments.length;
  for (let i = 1; i < length; i++) {
    args.push('arguments[' + i + ']');
  }

  let result = eval('finalContext.fn(' + args + ')');
  delete finalContext.fn;
  return result;
};

// 相比 call，apply 要判定 arg 是否为空，如果为空，直接调用函数
// 否则跟 call 一样
Function.prototype.applySimulator = function (context, arg) {
  let finalContext = context || window;
  finalContext.fn = this;

  let result;
  if (!arg) {
    result = finalContext.fn(); // 没有参数，就直接执行函数
  } else {
    var length = arg.length;
    let args = [];
    for (let i = 0; i < length; i++) {
      args.push('arguments[' + i + ']');
    }
    eval('finalContext.fn(' + args + ')');
  }

  delete finalContext.fn;
  return result;
};

// 简单版，没有考虑绑定函数作为构造函数的情形
Function.prototype.bindSimulator = function(context) {
  var self = this; // this 就是要执行的函数
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(context, args.concat(bindArgs));
  }
}

// 完整版
Function.prototype.bindFullSimulator = function(context) {

  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }

  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var FNOP = function() {};

  var boundFn = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(this instanceof FNOP ? this : context, args.concat(bindArgs));
  }

  FNOP.prototype = this.prototype;
  boundFn.prototype = new FNOP();
  return boundFn;
}

// 完整版 debounce, 支持立即调用 和 取消
function debounce(func, wait, immediate) {
  var timeout;
  var result; // 返回值
  var context;
  var args;

  var debounced = function () {
    context = this; // 修复 this 指向
    args = arguments; // 修复 event 对象

    timeout && clearTimeout(timeout);

    // 如果需要立即执行，先判断 wait 时间内是否有执行过，有的话就不执行；没有的话才立即执行
    if (immediate) {
      var callNow = !timeout; // 如果 timeout 存在，表示已经执行过，那就不需要立即执行
      // 这个定时器用于控制，在立即执行后的 wait 时间内，如果频繁触发事件，那是不会被执行，因为 timeout 不为 null
      // 等 wait 时间后，timeout 又变为 null，这时候新触发的函数又可以立即执行了
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) {
        // 立即执行才能得到返回值，前提是 func 是同步调用
        result = func.apply(context, args); // 如果可以立即执行，那就立即执行
      }
    } else {
      // 如果不需要立即执行，那就等触发后的 wait 毫秒后再执行
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
    return result;
  };

  // 取消防抖，这个只对 immediate 是 true 有用
  // immediate 是 false 的话，wait 毫秒还会执行
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

// 简易版 throttle
function throttle(fn, delay) {
  var timeout;
  var context;
  var args;

  return function () {
    context = this;
    args = arguments;
    if (!timeout) {
      timeout = setTimeout(() => {
        fn.apply(context, args);
        timeout = null;
      }, delay);
    }
  };
}

// 深拷贝
function deepCopy(obj) {
  if (typeof obj !== 'object') return;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] =
        typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}

// 数组扁平化，通过递归
function flatten(arr = []) {
  var result = [];
  var length = arr.length;
  var currentVal;
  for (var i = 0; i < length; i++) {
    currentVal = arr[i];
    if (Array.isArray(currentVal)) {
      result = result.concat(flatten(currentVal));
    } else {
      result.push(currentVal);
    }
  }
}

// 通过 toString 转换成 逗号分割的字符串，然后通过 split
// 拆分成数组；这种方法要求数组元素都是数字，否则toString后值可能会变化
function flatten2(arr = []) {
  return arr.toString().split(',').map(item => +item);
}

function flatten3(arr = []) {
  return arr.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten3(next) : next);
  }, []);
}