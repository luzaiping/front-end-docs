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