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

run(
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
)

/* function run(...fns) {
  let dispatch = index => {
    if (index === fns.length) return;
    const fn = fns[index];
    return fn(() => dispatch(index + 1))
  }
  dispatch(0);
} */



function run(...fns) {
  let dispath = index => {
    if (index === fns.length) return;
    let fn = fns[index]
    return fn(() => dispath(index + 1))
  }
  dispath(0)
}