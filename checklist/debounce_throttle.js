var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
  console.log('getUserAction:', e);
  container.innerHTML = count++;
};

function debounce(func, wait, immediate) {
  var timeout;
  var result; // 返回值
  var debounced = function() {
    var context = this; // 修复 this 指向
    var args = arguments; // 修复 event 对象
    
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
  }

  // 取消防抖，这个只对 immediate 是 true 有用
  // immediate 是 false 的话，wait 毫秒还会执行
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  }

  return debounced;
}

function throttle(fn, delay) {
  var context;
  var args;
  var previous = 0;

  return function() {
    var now = +new Date();
    if (now - previous >= delay) {
      fn.apply(context, args);
      previous = now;
    }
  }
}

function throttle2(fn, delay) {
  var timeout;
  var context;
  var args;

  return function() {
    context = this;
    args = arguments;
    if (!timeout) { // 没有启动定时器，就启动一个；有的话就什么也不做，等定时器执行完
      timeout = setTimeout(function() {
        fn.apply(context, args);
        timeout = null;
      }, delay);
    }
  }
}

// container.onmousemove = getUserAction;
// container.onmousemove = debounce(getUserAction, 500);
container.onmousemove = throttle2(getUserAction, 500);