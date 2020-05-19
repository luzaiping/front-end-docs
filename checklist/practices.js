/**
 * 常见笔试题
 */

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

/**
 * 通过递归的方式复制。这种实现方式效率低，并且没有处理一些特殊值
 * 用于常规笔试正常是够了
 * @param {Object} obj 
 */
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

// 数组扁平化，通过递归实现
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

// 数组扁平化实现二。通过 toString 转换成 逗号分割的字符串，然后通过 split
// 拆分成数组；这种方法要求数组元素都是数字，否则toString后值可能会变化
function flatten2(arr = []) {
  return arr.toString().split(',').map(item => +item);
}

// 数组扁平化实现三。通过 reduce 递归处理，跟方法一类似
function flatten3(arr = []) {
  return arr.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten3(next) : next);
  }, []);
}

// 数组去重方法一：通过 indexOf 判断值在新数组中是否存在
function unique(arr = []) {
  if (Array.isArray(arr)) throw new Error(`输入参数 ${arr} 必须是数组类型`);
  const { length } = arr;
  let currentVal;
  const result = [];
  for (let i = 0; i < length; i++) {
    currentVal = arr[i];
    if (result.indexOf(currentVal) === -1) {
      result.push(currentVal);
    } 
  }
}

// 数组去重方法二：先排序数组，然后判定相邻值是否相等，不相等就添加到数组里
function unique2(arr = []) {
  // 这边省略参数校验
  const sortedArr = arr.concat().sort();
  const { length } = sortedArr;
  const result = [];
  let previousVal;
  let currentVal;
  for (let i = 0; i < length; i++) {
    currentVal = sortedArr[i];
    if (i === 0 || previousVal !== currentVal) {
      result.push(currentVal);
    }
    previousVal = currentVal;
  }
  return result;
}

/**
 * 数组去重实现三：这个实现是上面两种实现的组合
 * 如果 isSorted 是 true，就采用比较相邻值进行去重
 * 否则采用 indexOf 的方式去重
 * @param {Array} arr 要去重的数组
 * @param {Boolean} isSorted arr 是否已经排好序
 */
function unique3(arr = [], isSorted) {
  const { length } = arr;
  const result = [];
  let previousVal; // 前一个值
  let currentVal; // 当前循环的值

  for (let i = 0; i < length; i++) {
    currentVal = arr[i];
    if (isSorted) {
      if (i === 0 || previousVal !== currentVal) {
        result.push(currentVal);
      }
      previousVal = currentVal;
    } else {
      if (result.indexOf(currentVal) === -1) {
        result.push(currentVal);
      }
    }
  }
  return result;
}

/**
 * 数组去重实现四：新增支持 iteratee，这个可以对数组元素进行特别处理
 * 比如 a 和 A 当成是重复值处理，那就可以通过这个函数将值都转换为小写，然后再比较
 * @param {Array} arr 要去重的数组
 * @param {Boolean} isSorted arr 是否已排序
 * @param {Function} iteratee 迭代函数，对数组元素进行处理
 */
function unique4(arr = [], isSorted, iteratee) {
  const { length } = arr;
  const result = [];
  let previous = []; // 前一个值
  let currentVal;
  let computedVal;

  for (let i = 0; i < length; i++) {
    computedVal = arr[i];
    computedVal = iteratee ? iteratee(currentVal, i, arr) : currentVal;

    if (isSorted) {
      if (i === 0 || previous !== computedVal) {
        result.push(currentVal);
      }
      previous = computedVal; // 这边将 previous 的类型做了转换
    } else if (iteratee) {
      // 如果不是已排序，但是支持 iteratee, 那就需要两个数组来分别存放
      // computedVal 和 currentVal, 其中存放 computedVal 的数组用于判定
      // 是否是重复的值。存放 currentVal 是目标值
      if (previous.indexOf(computedVal) === -1) {
        previous.push(computedVal);
        result.push(currentVal);
      }
    } else {
      if (result.indexOf(computedVal) === -1) {
        result.push(currentVal);
      }
    }
  }
  return result;
}

/**
 * 使用 filter 简化上面的实现，相当于原先的 for 循环改用 filter 来处理
 * @param {Array} arr 
 */
function uniqueFilter(arr = []) {
  // array.indexOf(value) 只会返回第一个匹配的索引
  // 如果有重复的值，那么值的索引就不会大于 array.indexOf(value)
  return arr.filter((value, index, array) => array.indexOf(value) === index);
}

// 对数组进行排序后再去重，这个效率要比没有排序快一点
function uniqueSortedFilter(arr = []) {
  return arr.contact().sort().filter((value, index, array) => index === 0 || value !== array[index - 1]);
}

// 使用 object 去重，将去重的值作为 object 的 key，value 随便，只要 obj.hasOwnProperty(value) 存在，那就是重复值
// 否则将存储这个值. 这种方法，1 和 '1' 会被当作是重复值，导致去重后有问题
function uniqueObject(arr = []) {
  const obj = {};
  return arr.filter((value) => {
    return obj.hasOwnProperty(value) ? false : (obj[value] = true);
  })
}

// 这种方式是上面的改进，使用 typeof value + JSON.stringify(value)
// 生成 value 对应的唯一 key
function uniqueObjectKey(arr = []) {
  const obj = {};
  let key;
  return arr.filter(value => {
    key = typeof value + JSON.stringify(value);
    return obj.hasOwnProperty(key) ? false : (obj[key] = true);
  })
}

// 使用 ES6 Set 去重
function uniqueSet(arr = []) {
  // return Array.from(new Set(arr));
  return [...new Set(arr)];
}

// 使用 ES6 Map 去重
function uniqueMap(arr = []) {
  const map = new Map();
  return arr.filter(value => !map.has(value) && map.set(value, 1));
}

