process
=========================

## Events

### beforeExit

当 Nodejs 清空其事件循环并且没有额外的任务需要处理时，就会触发 beforeExit 事件。通常 nodejs 进程在没有任务可调度时会退出，但是在 beforeExit 事件上注册的监听函数可以进行异步调用，从而导致 Node.js 进程继续运行。

调用监听器回调函数会将 process.exitCode 的值作为唯一参数传入。

对于导致显示终止的情形，是不会触发 'beforeExit' 事件，比如调用 process.exit() 或者出现没有未捕获的异常

除非打算安排额外的工作，否则不应将 beforeExit 作为 exit 事件的替代方案。

```js
process.on('beforeExit', exitCode => {
  console.log('Process beforeExit event with code: ', exitCode);
});

process.on('exit', exitCode => {
  console.log('Process exit event with code: ', exitCode);
});

console.log('This message is displayed first.');
```

### exit

当 Node.js 进程因为以下原因即将退出时，就会触发 exit 事件：

+ 显示调用 process.exit()
+ Node.js event loop 不再需要执行任何其他 work

此时无法阻止退出 event loop。并且一旦所有 emit 事件函数都执行完成，Node.js 进程就会终止。

事件监听函数可以接收一个 exitCode，这个 code 要嘛由 process.exitCode 指定，要嘛由 process.exit() 参数指定。

事件监听函数必现执行同步操作。因为在调用 exit 事件函数后，Node.js 进程会立即退出，这会导致任何在 event loop 排队的 works 都会被放弃，比如下面的代码，timeout 将永远不会被执行：
```js
process.on('exit', code => {
  setTimeout(() => {
    console.log('This will never run.');
  });
});
```

### message

如果当前进程是通过 IPC channel 产生 (比如 child_process 或者 cluster), 当子进程接收到父进程通过 childProcess.send() 发送的 message 时，会触发 message event。

被传递的 message 数据会经过序列号和解析。因此最终接收到的 message 可能跟一开始发送的不一样。

如果在产生 process 时指定了 serialization 值为 *advanced*，那么 message 信息可以包含 JSON 无法表示的数据。

### disconnect

如果当前进程是通过 IPC channel 产生 (比如 child_prcess 或者 cluster), 当 IPC channel 关闭时，disconnect 事件会被触发

__IPC__: Inter_Process Communication 进程间通信

### uncaughtException

当未捕获的异常一直冒泡到 Event Loop，就会触发 uncaughtException 事件。默认情况，Node.js 通过打印 stack trace 到 stderr 并使用 exiting code 为 1 来处理此类异常，从而覆盖先前设置的 process.exitCode。或者在事件处理函数中修改 process.exitCode 可以导致进程以指定的 process.exitCode 退出。

```js
process.on('uncaughtException', (err, origin) => {
  fs.writeFileSync(process.stderr.fd, `Caught exception: ${err}\nException origin: ${origin}`);
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

nonexistentFunc();

console.log('This will not run.');
```

使用 uncaughtException 事件作为异常处理的最后补救机制是一种非常粗糙的做法。uncaughtException 事件函数不应该作为 **On Error Resume Next** (出错后恢复并延续工作)的等价机制。uncaughtException 本身就意味着应用已经处于未定义的状态中；基于这种状态，如果恢复并继续运行应用，可能会造成未知或不可预测的问题。在这个事件函数中抛出的异常，是不会被捕获。为了避免出现无限循环，进程会以非 0 的 exit code 结束，并打印堆栈信息。

正确使用 uncaughtException 事件的方式是使用它在进程结束前，执行一些对已分配的资源 (比如 fd，handlers 等等) 进行清理的工作。触发 uncaughtException 事件后，尝试恢复应用的操作是不安全

### uncaughtExceptionMonitor

uncaughtExceptionMonitor 事件在以下两种情形被触发：
+ 在 uncaughtException event 被触发前触发
+ 在通过 process.setUncaughtExceptionCaptureCallback() 注册的 hook 被调用时触发

注册 uncaughtExceptionMonitor 事件不会改变 uncaughtException 的行为，如果没有注册 uncaughtException，进程一样会崩溃。

这个事件处理函数通常用于添加自定义的 monitor，以记录 uncaughtException 到 log 里。

```js
process.on('uncaughtExceptionMonitor', (err, origin) => {
  MyMonitoringTool.logSync(err, origin);
});

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();

// Still crashes Node.js
```

### unhandledRejection

如果在一次 event loop 中，promise 被 reject，并且没有绑定相应的 error handler，那么 unhandledRejection 事件就会被触发。

```js
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
})

somePromise.then(res => {
  return reportToUser(JSON.pasre(res)); // 这边 parse 写错成 pasre 会出现异常
})

// no `.catch()` or `.then()`
```

### rejectionHandled

The 'rejectionHandled' event is emitted whenever a Promise has been rejected and an error handler was attached to it (using promise.catch(), for example) later than one turn of the Node.js event loop.

这个事件的触发场景和应用还不清楚, 后面理解了再来补充。

### multipleResolves

当一个 promise 有如下行为就会触发 multipleResolves 事件：
+ resolved 不止一次
+ rejected 不止一次
+ resolve 之后又 reject
+ reject 之后又 resolve

```js
process.on('multipleResolves', (type, promise, reason) => {
  console.error('event: ', type, promise, reason);
  setImmediate(() => process.exit(1));
});

async function main() {
  try {
    return await new Promise((resolve, reject) => {
      resolve('First call');
      resolve('Swallowed resolve');
      reject(new Error('Swallowed reject'));
    });
  } catch (error) {
    throw new Error('Failed');
  }
}

main().then(console.log);
```

上面这个例子，会打印两次 *event: xxxx*：
+ 第一次是因为 resolve('Swallowed resolve'), 此时 promise 已经被 resolve 两次
+ 第二次是因为 reject(new Error('Swallowed reject')); promise 在 resolve 之后又 reject

这个事件对于使用 Promise 构造函数时，跟踪应用程序中的潜在错误非常有用。

### warning

任何时候 Node.js 进程触发警告，都会触发 warning 事件。

Node.js 当检测到可能导致应用性能问题、bugs、安全威胁相关的不好代码实践时，就会触发 warning

```js
promise.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
})
```

默认，Node.js 会将 warning 信息打印到 stderr 中。命令行选项 ***--no-warnings*** 可以用来阻止这个默认行为，即不会将 warning 信息输出到 stderr 中，但是这个不会阻止 warning 事件的触发。

```sh
$ node --no-warnings
> const p = process.on('warning', (warning) => console.warn('Do not do that!'));
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> Do not do that!
```

命令行选项 ***--trace-warnings*** 可以让控制台打印出 warning 的完整 stack trace 信息

