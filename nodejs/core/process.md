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

## 方法

### process.abort()

这个方法会使 Node.js 进程立即结束，并生成一个核心文件。Worker 线程没有这个特性。

### process.chdir(directory)

+ directory `<string>`

process.chdir() 方法变更 Node.js 进程的当前工作目录，如果变更目录失败会抛出异常（例如，如果指定的 directory 不存在）

```js
console.log(`Starting directory: ${process.cwd()}`);

try {
  process.chdir('/tmp');
  console.log(`New directory: ${process.cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}
```

### process.cpuUsage([previousValue])

+ previousValue `<Object>` 上一次调用 process.cpuUsage() 的返回值
+ 返回 `<Object>`
   - user `<integer>`
   - system `<integer>`

这个方法返回一个对象，该对象包含了当前进程的用户 CPU 时间和系统 CPU 时间，分别对应 user 和 system 属性；属性值的单位都是微秒(microsecond, 即百万分之一秒)。这2个属性值分别计算了执行用户程序和系统程序的时间，如果该进程在执行任务时是基于多核 CPU，值可能比实际花费的时间要大。

如果传递了上一次调用的返回值作为参数，得到的属性值就是与上一次的差值。

```js
const startUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

const now = Date.now();

while (Date.now() - now < 500);

console.log(process.cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

### process.cwd()

+ 返回 `<string>`

该方法返回 Node.js 进程的当前工作目录

```js
console.log(`${process.cwd()}`)
```

### process.disconnect()

如果 Node.js 进程是通过 IPC channel 衍生出来的，则 process.disconnect() 会关闭到父进程的 channel，以允许一个子进程一旦没有其他链接来保持其处于活跃状态的情形下，可以优雅地关闭。

调用 process.disconnnect() 和在父进程上调用 childProcess.disconnect() 效果是一样的。

如果 Node.js 进程不是通过 IPC channel 衍生 (spawned) 出来的，那么调用这个方法就会返回 undefined.

### process.dlopen(module, filename[, flags])

+ module `<Object>`
+ filename `<string>`
+ flags `<os.constants.dlopen>` **Default:** os.constants.dlopen.RTLD_LAZY  

这个方法用于动态加载共享对象。它主要是 require() 用于加载 C++ 插件使用，除非特殊情况，否则不应该直接使用这个方法。换句话说，除非特殊原因，都应该是require() 应该优先于 process.dlopen()。

flags 参数是允许指定 dlopen 行为的 常量。

如果有特殊的原因要使用 process.dlopen() (比如，需要指定 dlopen 标志)，经常会使用 `require.resolve()` 来查找模块路径。

调用 process.dlopen() 的一个重要缺点是必现传入 module 实例。C++ 插件导出的 functions 可以通过 module.exports 进行访问。

下面示例展示了如何加载一个名称为 binding 的 C++ 插件，该插件导出一个名称为 foo 的函数。通过传入 RTLD_NOW 常量，将在调用返回之前加载所有的 symbols：

```js
const os = require('os');
process.dlopen(module, require.resolve('binding'), os.constants.dlopen.RTLD_NOW);
module.exports.foo(); // 在 module.exports 上可以访问到导出的 functions
```

### process.emitWarning(warning[, options])

+ warning `<string>` | `<Error>` The waring to emit.
+ options `<Object>`
   - type `<string>` 如果第一个参数 waring 是 String 类型，type 用于指定被触发的警告类型名称。默认值是 **Warning**
   - code `<string>` 用于表示被触发警告的唯一标识码
   - ctor `<Function>` 用于限制生成的 stack trace 的可选函数。默认值是 **process.emitWarning**
   - detail `<string>` additional text to include with the error.

这个方法可以用于触发自定义或者应用特定的进程警告信息。可以通过给 warning 添加事件处理函数来监听这个这些警告信息。

```js
process.emitWarning('Something happened!', {
  code: 'MY_WARNING',
  detail: 'This is some additional information.'
});
```

上面这个例子，process.emitWarning() 内部会生成一个 Error 对象，并传给 'warning' 事件处理函数：

```js
process.on('warning', (warning) => {
  console.warn(warning.name); // 'Warning'
  console.warn(warning.message); // 'Something happened!'
  console.warn(warning.code); // 'MY_WARNING'
  console.warn(warning.stack); // Stack trace
  console.warn(warning.detail); // 'This is some additional information'
})
```

如果第一个参数 warning 传的是 Error 对象，第二个参数 options 就会被忽略。

### process.emitWarning(warning[, type[, code]][, ctor])

这个跟上面 process.emitWarning(warning[, options]) 类似，只是将 options 对象里的属性值拆分出来而已，相比于 options 的调用方式，这个方法不能指定 detail 信息。

#### 避免重复警告

作为最佳实践，警告应该在每个进程中只触发一次。要实现这个要求，推荐在使用 emitWarning 之前使用一个简单的 boolean 值做判断

```js
function emitWarning() {
  if (!emitWarning.warned) {
    emitWarning.warned = true;
    process.emitWarning('Only wan once!');
  }
}

emitWarning(); // Emits: (node: 56339) Warning: Only warn once!

emitWarning(); // Emits nothing
```

### process.exit([code])

+ code `<integer>` exit code. **Default:* 0

该方法 instructs Node.js 以指定的 code 同步地终止进程。如果省略了 code，就会使用 success code (0) 或者 process.exitCode 的值(如果已设置) 退出。在调用所有的 'exit' 事件处理函数之后，Node.js 进程才会终止。

```js
process.exit(1);
```
上面代码以 failure code (1) 退出进程。执行 Node.js 的 shell 将会看到 exit code 是 1.

调用 process.exit() 会强制进程尽快地退出，即使 event loop 中还有尚未完成执行完的异步操作，包括往 process.stdout 和 process.stderr 的 I/O 操作。

大多数场景，并不需要显示调用 process.exit()。当 event loop 中没有 pending work 时，Node.js 进程会自行退出。可以设置 process.exitCode 以告知当进程退出时，将使用哪个 exit code。

下面演示了一个 process.exit() 的错误使用示例：

```js
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exit(1);
}
```

这个例子可能会导致打印到 stdout 的信息被截取或者丢失。会出现这种问题是因为 process.stdout 有时候是异步操作，可能发生在 Event Loop 的多个 ticks 中。而调用 process.exit() 会强制进程退出，然后才能执行往 stdout 的写入操作。

针对这种情况，代码不应该直接调用 process.exit()，而应该设置 process.exitCode, 这样可以允许 Node.js 进程自然地退出，避免为 event loop 调度其他任何其他工作。

```js
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exitCode = 1;
}
```

如果因为某些错误场景需要终止 Node.js 进程，应该通过抛出未捕获的错误以允许进程相应地终止，这比调用 process.exit() 要更安全。

在 Worker 线程中，这个方法会停止当前线程而不是当前进程。

### process.getegid()

+ 返回：`<Object>`

The process.getegid() returns the numerical effective group identify of the Node.js process.
```js
console.log(`Current gid: ${process.getegid()}`);
```

这个方法只在 POSIX 平台上有效。(Windows 和 Android 不能用)

### process.geteuid()

+ 返回：`<Object>`

The process.geteuid() method returns the numerical effective user identify of the process.

```js
if (process.geteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
}
```
这个方法只在 POSIX 平台上有效。(Windows 和 Android 不能用)

### process.getgid()

+ 返回：`<Object>`

The process.getgid() returns the numerical group identify of the process.

这个方法只在 POSIX 平台上有效。(Windows 和 Android 不能用)

这个方法同 process.getegid() 的唯一区别是，前一个是获取 ***effective*** group identify.

### process.getgroups()

+ Returns: `<integer[]>`

The process.getgroups() method returns an array with the supplementary group IDs. POSIX leaves it unspecified if the effective group ID is included but Node.js ensures it always is.

This function is only available on POSIX platforms (i.e. not Windows or Android).

### process.getuid()

+ 返回：`<integer>`

The process.getuid() method returns the numeric user identify of the process.

```js
if (process.getuid) {
  console.log(`Current uid: ${process.getuid()}`)
}
```

This function is only available on POSIX platforms (i.e. not Windows or Android).

### process.hasUncaughtExceptionCaptureCallback()

+ 返回 `<boolean>`

Indicates whether a callback has been set using `process.setUncaughtExceptionCaptureCallback()`;

### process.hrtime([time])

+ time `<integer[]>` 上一次调用 process.hrtime 的返回值
+ 返回：`<integer[]>`

这个 JS 在引入 bigint 之前， `process.hrtime.bigint()` 的 legacy version。

process.hrtime() 返回当前实时时间，这个时间是一个以 *[seconds, nanoseconds]* 元数组表示的高精度解析值，其中 nanoseconds 是当前时间无法使用秒精度表示的的剩余部分。

time 参数是可选参数，这个值必须是前一个 process.hrtime() 的返回值，这个参数用于与本次调用做差值计算。如果传入的参数值不是**tuple array**, 就会抛出 TypeError。如果传入的是一个用户自定义的数组，会导致不确定的行为。

这些时间都是相对于过去的某个时刻的值，与一天中的时钟时间没有关系，因此不受制于时钟偏差。这个方法主要用于测试性能。

```js
const NS_PER_SEC = 1e9;

const time = process.hrtime(); // [ 1800216, 25 ]

setTimeout(() => {
  const diff = process.hrtime(time); // [ 1, 552 ]
  console.log(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
  // Benchmark took 1000000552 nanoseconds
}, 1000);
```

### process.hrtime.bigint()

+ 返回 `<bigint>`

process.hrtime() 的 bigint 版本，返回当前的高精度实际时间 (以 nanosecond 为单位)

与 `process.hrtime()` 不同的是，这个方法不支持额外的 time 参数，因为可以直接通过两个 bigint 的相减来计算差值

```js
const start = process.hrtime.bigint(); // 191051479007711n

setTimeout(() => {
  const end = process.hrtime.bigint(); // 191052633396993n

  console.log(`Benchmark took ${end - start} nanoseconds`);
  // Benchmark took 1154389282 nanoseconds
}, 1000)
```

### process.kill(pid[, singal])

+ pid `<number>` 进程 ID
+ signal `<string>` | `<number>` 要发送的信号，类型为 string 或 number。**默认值**是 'SIGTERM'

process.kill() 方法用于发送 signal 给到 pid 对应的进程。

signal 名称如果是字符串的话，就是类似 'SIGINT' 或 'SIGHUP' 这样的值

如果 pid 对应的进程不存在，调用这个方法会抛出异常。作为特殊例子，signal 值为 0，可以用来检测进程是否存在。在 Windows 平台上，如果 pid 是用于对应一个 process group，这个方法会抛出异常。

这个方法名称虽然是 kill，但是实际只是用于发送 signal，这点类似于操作系统调用 kill 命令。发送 signal 可能是做一些与 kill 目标进程无关的事情。

```js
process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
})

setTimeout(() => {
  console.log('Exiting...');
  process.exit(0);
}, 100);

process.kill(process.pid, 'SIGHUP');
```

如果 Node.js 进程接收到 **SIGUSR1** 信号时，就会启动调试器 (debugger).

### process.memoryUsage()

+ 返回 `<Object>`
   - rss `<integer>`
   - heapTotal `<integer>`
   - headUsed `<integer>`
   - external `<integer>`
   - arrayBuffers `<integer>`

这个方法返回一个对象，描述 Node.js 进程的内存使用情况，对象中的每个属性值都是以 byte 为单位

```js
console.log(process.memoryUsage())
```

会得到:
```
{
  rss: 4935680,
  heapTotal: 1826816,
  heapUsed: 650472,
  external: 49879,
  arrayBuffers: 9386
}
```

+ heapTotal 和 heapUsed 代表 V8 的内存使用情况
+ external 代表由 V8 管理的，绑定到 JS 的 C++ 对象的内存使用情况
+ rss：Resident Set Size，是给这个进程分配了多少物理内存（占总分配内存的一部分），包含所有 C++ 和 JS 对象和代码
+ arrayBuffers 指分配给 ArrayBuffer 和 SharedArrayBuffer 的内存，包括所有的 Nodejs Buffer。这个也包含在 external 值中。当 Nodejs 作为嵌入库使用时，这个值可能为 0，因为在这种情况下可能无法追踪 ArrayBuffer 的分配。

当使用 Worker 线程时，rss 是一个对整个进程有效的值，而其他值只指向当前线程。

### process.nectTick(callback[, ...args])

关于这个的使用已经很熟悉了，就不展开了

### process.resourceUsage()

+ 返回 `<Object>` 当前进程的资源使用情况。所有资源信息都是来自于调用 **uv_getrusage**。涉及的信息毕竟多，就不展开了

### process.send(message[, sendHandle[, options]][, callback])

+ message: `<Object>`
+ sendHandle: `<net.Server>` | `<net.Socket>`
+ options: `<Object>` used to parameterize the sending of certain types of handles。options 支持下面属性：
   + keepOpen `<boolean>` 当传递 net.Socket 实例时可以使用的值。当值为 true，socket 在发送的过程中保持 open 状态。默认值是 false
+ callback `<Function>`
+ 返回 `<boolean>`

如果 Nodejs process is spawned with an IPC channel, the process.send() can be used to send messages to parent process. Messages will be received as 'message' event on the parent's ChildProcess Object.

If Node.js was not spawned with an IPC channel, process.send will be undefined.

消息会经过 serialization 和 parsing。The resulting message might not be the same as what is originally sent.

### process.setegid(id)

+ id `<string>` | `<number>` group name or ID

The process.setegid set effective group identify of the process. The id can be passed as either a numeric or a group name string. If a group name is specified, this method block while resolving the associated a numeric ID.

```js
if (process.getegid && process.setegid) {
  console.log(`Current gid: ${process.getegid()}`);
  try {
    process.setegid(501);
    console.log(`New gid: ${process.getegid()}`)
  } catch (err) {
    console.log(`Failed to set gid: ${err}`)
  }
}

```
This function is only available on POSIX platform (i.e. not Windows or Android). This feature is not available in Worker threads.

### process.seteuid(id)

+ id `<string>` | `<number>` A user name or ID

The process.seteuid() method set the effective user identify of the process. The id can be numeric ID or a username string. If a username string is specified, the method blocks while resolving the associated with numeric ID.

This function is only available on POSIX platform (i.e. not Windows or Android). This feature is not available in Worker threads.

### process.setgid(id)

类似于 process.setegid(id)

### process.setgroups(groups)

process.setgroups(groups) method set the supplementary group IDs for the Node.js process. This is privileged  operation that requires the Node.js process to have root or CAP_SETGID capability.

The groups array can contain numeric group IDs, group names or both.

This function is only available on POSIX platform (i.e. not Windows or Android). This feature is not available in Worker threads.

### process.setuid(id)

类似于 process.seteuid(id)

### process.setUncaughtExceptionCaptureCallback(fn)

The process.setUncaughtExceptionCaptureCallback() function sets a function that will be invoked when an uncaught exception occurs, which will receive exception value itself as its first argument.

If such a function is set, the **'uncaughtException'** event will not be emitted. If `--abort-on-uncaught-exception` was passed from the command line or set through `v8.setFlagsFromString()`, the process will not abort.

To unset the capture function, process.setUncaughtExceptionCaptureCallback(null) may be used. 如果之前已经设置了 callback，之后调用该方法并传递一个非 null 的参数值，会导致异常

### process.umask(mask)

+ mask `<string>` | `<integer>`

process.umask() sets the Node.js process's file mode creation mask.(文件模式的创建掩码). Child processes inherits the mask from the parent process. Retruns the previous mask.

```js
const nwemask = 0o022;
const oldmask = process.umask(newmask);
console.log(`Changed umask from ${oldmask.toString(8)} to ${newmask.toString(8)}`);
```

In Worker threads, process.umask(mask) will throw an exception.

### process.uptime()

The process.uptime() method returns the number of seconds the current Node.js process has been running.

返回值会包含秒的分数(即小数位), 可以使用 Math.floor() 得到整数秒。

### 方法总结

process 包含了一些相呼应的方法：

+ getegid(), geteuid(), getgid(), getgroups(), getuid()  5个获取 uid 和 gid 的方法
+ setegid(id), seteuid(id), setgid(id), setgroups(groups), setuid(id) 5个相依的设置 uid 和 gid 的方法
+ hasUncaughtExceptionCaptureCallback, setUncaughtExceptionCaptureCallback(fn)  设置未捕获异常callback，以及是否有设置
+ memoryUsage(), resourceUsage()  获取进程内存使用情况，资源使用情况

## 属性

### process.allowedNodeEnvironmentFlags

process.allowedNodeEnvironmentFlags 属性是 **NODE_OPTIONS** 环境变量中允许的特殊只读标志的 Set。

allowedNodeEnvironmentFlags 扩展了 Set 类型，重写了 `Set.prototype.has` 以识别几种可能不同的 flag 表示。

还有其他一些描述内容，这边先不展开，因为目前并不了解这个属性的用途。

### process.arch

+ Returns `<string>`

The operating system CPU architecture for which the Node.js binary was compiled.

这个属性值等同于 os.arch()

### process.argv

+ `<string[]>`

process.argv 返回一个字符串数组，其中包含当 Node.js 进程被启动时传入的命令行参数。

+ 第一个参数就是 process.execPath 对应的值. 如果需要访问 argv[0] 的原始值，需要使用 `process.argv0`
+ 第二个参数是正被执行的 JS 文件路径(完整路径)

比如 process-args.js 文件内容如下：
```js
process.argv.forEach((value, index) => {
  console.log(`${index}: ${value}`);
})
```
启动 Node.js 进程

```sh
node process-args.js one two=three four
```

最终会输出如下内容：

```
0: /usr/local/bin/node
1: /Users/mjr/node/process-args.js
2: one
3: two=three
4: four
```

### process.argv0

process.argv0 属性保存当 Node.js 启动时传入的 argv[0] 的原始值只读副本。

```sh
bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```
表示没看明白上面这个例子，后续再来补充吧。

正常 process.argv0 会等于 process.argv[0]

### process.channel

If the Node.js process is spawned with an IPC channel, the process.channel property is a reference to the IPC channel. If no IPC channel exists, this property is undefined.

#### process.channel.ref() & process.channel.unref()

ref(): makes the IPC channel keep the event loop of the process running if .unref() is called before.
unref(): makes the IPC channel not keep the event loop of the process running, and lets it finish while the channel is open.

Typically, this is managed through the number of 'disconnect' and 'message' listeners on the process object. However, this method can be used to explicitly request a specific behavior.

对于这2个方法的应用还不清楚，这边先简单记录下，后续再来补充。

### process.config

+ Returns `<Object>`

这个属性返回一个对象，其中包含用于编译当前 Node.js 可执行文件的JS表示形式的配置选项。这与运行 `./configure` 脚本时生成的 config.gypi 文件相同

通常这个对象会包含 **target_defaults** 和 **variables** 两个属性。

### process.connected

+ Returns `<boolean>`

如果 Node.js 进程是通过 IPC channel 生成的，只要 IPC channel 保持连接状态，这个值就会返回 ture。当调用 process.disconnect() 后，这个值就会返回 false

一旦 process.connected 为 false，就不能通过 IPC channel 使用 process.send() 发送信息。

### process.debugPort

+ Returns `<number>`

The port used by the Node.js debugger when enabled.

```js
process.debugPort = 5858;
```

### process.env

这个属性返回一个包含 user enviroment 的对象, 可能包含如下信息：
```
ERM: 'xterm-256color',
SHELL: '/usr/local/bin/bash',
USER: 'nodejscn',
PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
PWD: '/Users/nodejscn',
EDITOR: 'vim',
SHLVL: '1',
HOME: '/Users/nodejscn',
LOGNAME: 'nodejscn',
_: '/usr/local/bin/node'
```

可以修改此对象的属性值，不过这些修改不会影响 Node.js 进程之外，或者影响其他 Worker 线程。比如下面这个就不会起作用：

```sh
node -e 'process.env.foo="bar"' && echo $foo
```

上面这个不会打印出 bar

下面这样就可以有效:
```js
process.env.foo = 'bar';
console.log(process.env.foo); // bar
```

在 process.env 上设置属性值会隐式地将值转换为字符串。***强烈不推荐这么设置属性值。*** 如果值不是字符串、数字 或 boolean，Nodejs 未来版本可能会抛出错误。

可以使用 delete 从 process.env 中删除属性

```js
process.env.TEST = 1;
delete process.env.TEST;
console.log(process.env.TEST); // undefined
```

在 Windows 系统上，环境变量是不区分大小写
```js
process.env.TEST = 1;
console.log(process.env.test);
// => 1
```

除非在创建 Worker 实例时显示地指定，否则每个 Worker 线程都会有基于父线程的一份 process.env 副本。

### process.execArgv

+ Returns `<string[]>`

process.execArgv 返回当 Node.js 进行启动时，一组Node.js 特定的命令行选项。这些选项不会出现在 process.argv 属性返回的数组中，并且不包含 Node.js executable、the name of the script、or any options following the script name. These options are useful in order to spawn child process with the same execution enviroment as the parent.

```sh
node --harmony script.js --version
```

Results in process.execArgv:

`['--harmony']`

and process.argv:

`['/usr/local/bin/node', 'script.js', '--version']`

### process.execPath

+ `<string>`

This property returns the absolute pathname of the executable that started the Node.js process.

`/usr/local/bin/node`

### process.exitCode

当进程正常退出，或通过 process.exit() 退出且未指定退出码时，此数值将作为进程的退出码。

通过 process.exit(code) 指定的 exit code 会覆盖之前通过 process.exitCode 设置的 exit code。

### process.noDeprecation

process.noDeprecation 属性表明是否在当前 Node.js 进程上设置了 `--no-deprecation` 标志。

### process.pid
+ `<integer>`

这个属性返回进程的 PID

```js
console.log(`This process is pid: ${process.pid}`);
```

### process.platform

+ `<string>`

这个属性返回当前 Node.js 进程所运行的操作系统平台。可能的值有：'aix', 'darwin', 'fresbsd', 'linux', 'openbsd', 'win32'

这个属性等同于 `os.platform()`.

### process.ppid

+ `<integer>`

返回当前进程的父进程.

### process.release

这个属性返回与当前发布相关的元数据 object，其包括了源代码和源代码头文件 tarball 的 URL。

返回的 object 对象包含如下属性：
+ name `<string>` 对于 Node.js，这个值始终是 'node'。对于传统的 io.js 发布包，值为 'io.js'
+ sourceUrl `<string>` 指向一个 .tar.gz 文件的绝对URL，该文件包含了当前发布的源代码
+ headerUrl `<string>` 指向一个 .tar.gz 文件的绝对URL，该文件包含了当前发布的源代码的头文件信息。这个文件要不全部源代码文件小很多，可以用于编译 Node.js 原生插件
+ libUrl `<string>` 指向一个 node.lib 文件的绝对 URL，匹配当前发布的结构和版本信息。此文件用于编译 Node.js 本地插件。这个属性只在 Windows 版本存在，在其他平台无效。
+ lts `<string>` 标识当前发布的 LTS 标签的字符串。只有 LTS 版本存在这个属性，其他所有版本类型(包括当前版本) 这个属性值都是 undefined. 
```js
{
  name: 'node',
  lts: 'Argon',
  sourceUrl: 'https://nodejs.org/download/release/v4.4.5/node-v4.4.5.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v4.4.5/node-v4.4.5-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v4.4.5/win-x64/node.lib'
}
```

从 source tree 的非发布版本中构建的定制版本，可能只有 name 属性有效。其他的属性不一定存在。

### process.stderr / process.stdout / process.stdin

+ Returns `<Stream>` 

这3个属性分别返回连接到 stderr (fd 2), stdout (fd 1), stdin (fd 0) 的 stream。默认是一个 net.Socket (即是一个 Duplex Stream)，如果 fd 指向的是一个文件，那就是对于 Writable (fd 1 或 fd 2) 或 Readable (fd 0)

这3个属性都有一个 .fd 属性, 比如 process.stderr.fd, 指向了 the value of underlying file descriptor of stream。

#### process I/O 注意事项

process.stderr 和 process.stdout 与 Node.js 中其他 streams 在以下方面有重大区别：
+ They are used internally by console.log() and console.error(), respectively.
+ 写操作是否为同步操作，跟连接的是什么流以及操作系统是 Windows 还是 POSIX 有关：
   + 文件：在 Windows 和 POSIX 上都是同步操作
   + TTY (Terminals): 在 Windows 上是异步操作，在 POSIX 上是同步操作
   + Pipes (and sockets): 在 Windows 上是同步操作，在 POSIX 上是异步操作

同步写操作可以避免 console.log() 或 console.error() 产生不符合预期的输出交错问题；或是在异步写完成之前调用了 process.exit() 导致未写完整的问题。

同步写操作会阻塞 Event loop 直到写完成。当向一个交互终端会话进行写操作时，这可能不是个问题，但操作生产日志的进程输出流时需要特别留心。

### process.throwDeprecation

+ Returns `<boolean>`

这个属性初始值表明是否在当前的 Node.js 进程上设置了 `--throw-depreaction` flag. 这个值是可变的，可以在运行时动态设置。如果设置为 true，那么弃用 warning 会导致出错

### process.version

+ Returns `<string>`

返回 Node.js 的版本信息

### process.versions

+ 返回 `<Object>`

这个属性返回一个对象，包含了 Node.js 及其依赖的版本信息。process.versions.modules 标明了当前 ABI 版本，这个信息会随着一个 C++ API 变化而增加。Nodej.js 会拒绝加载这些 modules，如果这些 modules 是使用一个不同的 ABI 版本的模块编译。

```
node: '12.16.1',
v8: '7.8.279.23-node.31',
uv: '1.34.0',
zlib: '1.2.11',
brotli: '1.0.7',
ares: '1.15.0',
modules: '72',
nghttp2: '1.40.0',
napi: '5',
llhttp: '2.0.4',
http_parser: '2.9.3',
openssl: '1.1.1d',
cldr: '35.1',
icu: '64.2',
tz: '2019c',
unicode: '12.1'
```

### process.report

+ `<Object>`

这个对象包含了相关的属性和方法用于管理当前进程的诊断报告。

#### process.report.compact

+ `<boolean>`

判断诊断报告是否是 compact format，single-line JSON, 方便日志处理系统读取，而不是多行适合人类阅读的格式。

#### process.report.directory

+ `<string>`

报告的存储目录。默认是空字符串，表明报告是存储在 Node.js 进程的当前工作目录下。

#### process.report.filename

+ `<string>`

报告最终存储的文件。如果设置为空字符串，文件名称由 timestamp、PID 和 sequence number 组成。默认是空字符串

### exitCode

如果没有等待的异步操作需要处理，正常情况下，Node.js 会以状态码 0 退出。其他情况的进程退出，会使用以下的状态码：

+ 1：***Uncaught Fatal Exception***，并且没有被 domain 或者 'uncaughtException' 事件处理函数处理
+ 2: ***Unused*** (Bash 未防止内部滥用而保留)
+ 3：***Internal JS parse Error***；Nodejs 内部的 JS 源代码在引导进程中导致了一个语法解析错误。这种情形很少见，一般只会在开发 Node.js 本身的时候出现。
+ 4：***Internal JS Evaluation Error***。引导进程执行 Node.js 内部的 JavaScript 源代码时，返回函数值失败。 这是非常少见的, 一般只会在开发 Node.js 本身的时候出现。
+ 5：***Fatal Error***. 这是 V8 中出现了严重且无法恢复的错误。这种情形，通常会在 stderr 中打印出以 FATAL ERROR 开头的信息
+ 6：***Non-function Internal Exception Handler***. 出现未捕获异常，但是异常处理函数设置成非函数，导致无法被调用。
+ 7：***Internal Exception Handler Run-Time Failure***. 当出现异常，也设置了异常处理函数，但是在执行异常处理函数时，该函数本身抛出了错误。比如 'uncaughtException' 或者 'domain.on("error")' 对应的处理函数抛出了错误。
+ 8：Unused
+ 9：***Invalid Argument*** 指定了未知的选项 或者 没有给必须有值的参数提供值
+ 10： ***Internal JavaScript Run-Time Failure*** 这个也很少见
+ 12：***Invalid Debug Argument***. `--inspect` 和/或 `--inspect-brk` 选项已经设置，但选择的端口号无效或者不可用
+ `>128`: ***Signal Exists***, 如果 Node.js 接收到 fatal signal, 比如 SIGKILL 或 SIGHUP, 那么 exit code 将是 128 加上 singal code. 这是 POSIX 的标准做法: exit code 被定义为 7-bit integers, 并且 signal code 被设置为高位，然后包含 signal code. 比如 signal SIGABRT 的值是 6，那么最终的 exit code 就是 138 + 6, 即 134