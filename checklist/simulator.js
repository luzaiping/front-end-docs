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
function setTimeoutSimulator(callback, delay) {
  const timerId = setInterval(() => {
    clearInterval(timerId);
    callback();
  }, delay);
}

// 用 setTimeout 实现 setInterval
// 核心是 递归调用
const setIntervalSimulator = (callback, delay) => {
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

/**
 * 模仿 webpack 实现 commonjs 规范。
 * Babel 默认将 ES6 module 转换为 commonjs，然后 webpack 实现了一套 类 commonjs 的方式
 * 用于加载 module
 */
function webacpkLoadModuleSimulator() {
  // 待加载的 modules
  const modules = {
    // 模块内容，module是关于模块的对象，exports 是 module 对象的一个属性，值也是 对象
    // require 是加载模块的函数
    "main": function(module, exports, require) {
      var addModule = require("./add");
        console.log(addModule.add(1, 1))

        var squareModule = require("./square");
        console.log(squareModule.square(3));
    },
    "./add": function(module, exports, require) {
      console.log('加载了 add 模块');

      module.exports = {
          add: function(x, y) {
              return x + y;
          }
      };
  },
  "./square": function(module, exports, require) {
      console.log('加载了 square 模块');

      var multiply = require("./multiply");
      module.exports = {
          square: function(num) {
              return multiply.multiply(num, num);
          }
      };
  },

  "./multiply": function(module, exports, require) {
      console.log('加载了 multiply 模块');

      module.exports = {
          multiply: function(x, y) {
              return x * y;
          }
      };
  }
  };

  (function(modules) {
    var installedModules = {}

    function require(moduleName) {
      let module = installedModules[moduleName];

      if (!module) {
        // 如果模块不存在，则构造一个包含 exports 的 module 对象，并赋值给 installedModules[moduleName]
        module = installedModules[moduleName] = {
          exports: {}
        };
        // 调用指定模块函数，用于构造 module
        // 需要传入 module, module.exports, require
        modules[moduleName](module, module.exports, require);
      }

      return module.exports;
    }

    require('main');
  })(modules);
}