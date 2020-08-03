child_process
==================================

## 创建 child_process 实例

有4种方式创建 child_prcess 实例：
+ spawn(): 这个方法创建的子进程通常是用于执行外部的可执行脚本或程序。可以通过 stream 的方式得到执行脚本或程序的结果
+ exec(): 这个方法跟 spawn() 最大区别是，是通过 callback 方式得到子进程的输出结果
+ execFile()：这个跟 exec 的最大区别是，exec 是 spawn shell，然后在 shell 上运行 command；而 execFile 是直接执行 command，因此从效率上来说，execFile 要更快
+ fork(): 这个是 spawn() 的一种特例，生成的子进程是用于运行 Node.js 代码；而 spawn 通常是运行非 Node.js 的程序。

另外 spawn(), exec() 和 execFile() 都有对应的 sync 方法。

### exec(command[, options][, callback])

+ command: `<string>` 要运行的命令，参数使用空格分隔开。比如 `ls -l -a`。命令和参数是写一起，作为一个参数。
+ options: `<Object>`
   + cwd: `<string>` current working directory of child process. ***Default*** null.
   + env: `<Object>` 环境变量的键值对对象。***Default*** process.env
   + encoding: `<string>` ***Default*** 'utf8'
   + shell: `<string>` 用于执行 command 的 shell。***Default***：Unix上是 '/bin/sh', Windows 上是 process.env.ComSpec。这个方法 command 是需要运行在 shell 上，这是跟 exectFile 的一大区别。
   + timeout: `<number>` ***Default*** 是0
   + maxBuffer: `<number>` stdout 或 stderr 上允许的最大数据量（以 bytey 为单位）。如果超过这个限制，child process 就会终止，并且输出会被截断。***Default*** 是 1024*1024 （即 1M）。这个方法是将内容直接以 buffer 形式存储到内存中。因此需要占据比较大的内存，这是跟 spawn 和 fork 的一大区别。
   + killSignal `<string>` | `<integer>` ***Default*** 'SIGTERM'
   + uid `<number>` 设置进程的 user identify
   + gid `<number>` 设置进程的 group identify
   + windowHide `<boolean>` 隐藏在 Windows 系统上会创建的子进程控制台窗口。***Default*** false
+ callback：`<Function>` 当进程终止时，调用并输入 output
   + error `<Error>`
   + stdout `<string>` | `<Buffer>`
   + stderr `<string>` | `<Buffer>`
+ 返回：`<ChildProcess>`

spawn a shell then executes the command within that shell, buffering any generated output. command 字符串会被 shell 直接处理，因此特殊字符需要被相应地处理。

```js
exec('"/path/to/test file/file.sh" arg1 arg2') // 这边的文件路径必须使用双引号，这样路径中的空格才不会将这个参数拆分成多个参数
exec('echo "The \\$HOME variable is $HOME"'); // 第一个 $HOME 通过 \\ 被转义处理
```

如果 timeout 设置为大于 0 的数值，一旦子进程运行时间超过 timeout 时，父进程会向子进程发送由 kignSignal 属性标识的信号值（默认是 SIGTERM）

### child_process.execFile(file[, args][, options][, callback])

+ file: `<string>` 可执行文件的名称或者路径
+ args：`<string[]>` 字符串参数列表。这个方法命令参数是作为一个独立的参数，以字符串数组的形式表示。
+ options：`<Object>` 这个跟 exec 的 options 基本一样，除了下面参数：
   + windosVerbatimArguments `<boolean>` 在 Windows 上不为参数加上引号或者转义。Unix 上这个参数会被忽略。默认值是 false
   + shell：默认值是 false。即没有 shell。
+ callback  等同于 exec() 方法的 callback
+ 返回 `<ChildProcess>`

这个方法类似于 exec()，但默认情况下不会 spawn shell。指定的可执行文件 file 会被直接 spawn 出新的 process，因此相比 exec() 会稍微高效些。

```js
const { execFile } = require('child_process');
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) throw error;

  console.log(stdout);
})
```

stdout, stderr 会包含子进程的 stdout 和 stderr 的输出内容。默认情况下，Nodejs会使用 UTF-8 将输出内容解码为字符串。如果 encoding 参数指定为 buffer 或者无法识别的字符串编码，则 stdout 和 stderr 就会是 Buffer 对象。

如果将 shell 设置为 true，不可以将未经过处理的输入参数传给这个方法，否则会出现恶意攻击。比如 `rm -rf /`

### child_process.spawn(command[, args][, options])

+ command `<string>` 要运行的 command
+ args `<string>` 同 execFile 方法的 args 一样
+ options `<Object>` 类似 execFile/exec 的options，除了以下参数：
   + argv0 `<string>` 显示设置发送给 child process 的 argv[0] 值。如果没有指定，这个值会被设置为 command 参数值
   + stdio `<Array>` | `<string>` 子进程的 stdio 配置信息
   + detached `<boolean>` 使子进程独立于其父进程运行。具体行为跟 platforms 有关。
   + serialization `<string>` 指定在进程间发送消息的序列化类型。可能的值是 'json' 和 'advanced'。默认是 'json'

__注意这个方法没有 callback 参数__

这个方法使用给定的 command 参数 spawn 新的进程，并传入 args 中的命令行参数。如果省略 args，则默认为空数组。

***如果启用了 shell 选项，则不要将未经过处理的用户输入传给此函数。 包含 shell 元字符的任何输入都可用于触发任意命令的执行。***

```js
const { spawn } = require('child_process');

const ps = spawn('ps', ['ax']);
const grep = spawn('grep', ['bash']);

ps.stdout.on('data', (data) => {
  grep.stdin.write(data);
});

ps.stderr.on('data', (data) => {
  console.error(`ps stderr: ${data}`);
});

ps.on('close', code => {
  if (code !== 0) {
    console.log(`ps process exited with code ${code}`);
  }

  grep.stdin.end(); // 让 grep.stdin 关闭
});

grep.stdout.on('data', data => {
  console.log('grep stdout:\n', data.toString());
})

grep.stderr.on('data', data => {
  console.error(`grep stderr: ${data}`);
})

grep.on('close', code => {
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});

```

#### options.detached

By default, the parent will wait for the detached child to exit. To prevent the parent from waiting for a given subprocess to exit, use the subprocess.unref() method. Doing so will cause the parent's event loop to not include the child in its reference count, allowing the parent to exit independently of the child, unless there is an established IPC channel between the child and the parent.

#### options.stdio

这个配置项用于配置在父进程和子进程之间建立的 pipes。默认情况下，子进程的 stdin, stdout, stderr 会被重定向到 ChildProcess 对象上相应的 subprocess.stdin, subprocess.stdout, subprocess.stderr 流上。

为方便起见，options.stdio 可以是以下字符串之一:
+ 'pipe' 相当于 ['pipe','pipe','pipe'].这个也是默认值
+ 'ignore' 相当于 ['ignore','ignore','ignore'].
+ 'inherit' 相当于 ['inherit','inherit','inherit'].

除了是字符串之外，也可以是数组，其中每个索引值对应子进程中的 fd. 0、1、2 分别对应于 stdin、stdout、stdout.

### child_process.fork(modulePath[, args][, options])

+ modulePath: `<string>` The module to run in the child.
+ args: `<string[]>` 同 spawn/execFile 的 args 一样
+ options：这个参数跟 spawn 的类似，除了以下参数：
   + execPath: `<string>` 用于创建子进程的可执行文件
   + execArgv：`<string[]>` 传给可执行文件的字符串数组参数。默认值是 process.execArgv
   + silent: `<boolean>` 如果值为 true，子进程的 stdin，stdout 和 stderr 会 pipe 到父进程。如果为 false，则继承自父进程。默认值为 false
   + stdio：这个具体看后面 spawn.stdio 配置项

这个方法是 spawn() 的特例，专门用于 spawn 新的 Node.js 进程。同 spawn 方法一样，返回的 ChildProcess 对象会内置额外的 IPC，以允许父子进程之间传递消息。

除了IPC通道之外，父子进程之间是完全独立。每个进程有自己的 memory，自己的 V8 实例。由于需要额外的资源分配，因此不建议 spawn 大量的 Node.js 子进程。

### 事件

#### close

+ code `<number>` 子进程自行退出时的 exit code
+ signal `<string>` 子进程被终止时的 signal

当子进程的 stdio 流被关闭时会触发 'close' 事件。这与 'exit' 事件不同，因为多个进程可能会共享相同的 stdio

#### disconnect

在父进程中调用 `subprocess.disconnect()` 或在子进程中调用 `process.disconnect()` 后会触发 'disconnect' 事件。断开连接后就不能再发送或接收消息，且 `subprocess.connected` 属性值为 false

#### error

+ err `<Error>`

当出现以下情况时，会触发 'error' 事件：

+ The process could not be spawned, or
+ The process could not be killed, or
+ Sending a message to the child process failed.

当发生错误后，'exit' 事件可能会也可能不会被触发。当同时监听 'exit' 和 'error' 事件时，需要防止意外地多次调用 event handler。

#### exit

+ code: `<number>` Node.js 自行退出时的 exit code
+ signal：`<string>` 子进程被终止的信号

当子进程结束时会触发 'exit' 事件，如果进程退出，则 code 就是进程的最终 exit code，否则为 null。如果进程是因为收到信号而终止，则 signal 是信号的字符串名称，否则为 null。这2个参数值至少有一个不为 null。

当 'exit' 事件被触发时，子进程的 stdio 流可能还是保持打开状态。

Node.js 为 SIGINT 和 SIGTERM 建立了信号处理函数，当 Node.js 进程收到这些信号时不会立即终止。相反，Node.js 会执行一系列的清理操作，然后再重新 re-raise the handled signal.

#### message

+ message `<Object>` A parsed JSON object or primitive value.
+ sendHandle `<Handle>` A `net.Socket` 或 `net.Server` 对象，或者 undefined

当子进程调用 `process.send()` 发送消息时，会触发 'message' 事件

消息经过 serialization and parsing 进行传递，最终接收到的消息可能跟最初发送的不完全一样。

如果 spawn 子进程的时候，指定了 serialization option 为 'advanced'，那么 message 参数可以包含 JSON 无法表示的数据格式。

### 方法

#### subprocess.channel

+ `<Object>` 一个代表子进程 IPC channel 的 pipes

subprocess.channel 是对子进程 IPC channel 的引用。如果当前没有 IPC channel，则值为 undefined

#### subprocess.channel.ref()

This method makes the IPC channel keep the event loop of parent process running if .unref() has been called before.

#### subprocess.channel.unref()

This method makes the IPC channel not keep the event loop of parent process running, and let it finish even while the channel is open.

#### subprocess.disconnect()

这个方法会关闭父子进程之间的 IPC channel，一旦没有其他连接保持子进程活跃，则允许子进程正常退出。调用该方法后，父子进程各自的 subprocess.connected 和 process.connected 属性值都会是 false，并且进程之间不能再发送消息。

当进程中没有正被接收的消息时，就会触发 'disconnected' 事件，通常在调用 `subprocess.disconnect()` 后就会触发。

当子进程是一个 Node.js 实例时(比如通过 child_process.fork() 产生)，也可以在子进程中调用 `process.disconnect()` 方法来关闭 IPC channel

#### subprocess.kill([signal])

+ signal `<number>` | `<string>`
+ 返回：`<boolean>`

这个方法会向子进程发送一个 signal。如果没有指定 signal 参数，会使用 'SIGTERM' signal。如果 kill 成功就返回 true，返回返回 false

```js
const { spawn } = require('child_process');

const grep = spawn('grep', ['ssh']);

grep.on('close', (code, signal) => {
  console.log(`child process terminated due to receipt of signal ${signal}`);
});

grep.kill('SIGHUP');
```

如果 signal 无法送达子进程，ChildProcess 对象可能会触发一个 'error' 事件。向一个已经退出的子进程发送 signal 不是一个错误，但可能有无法预料的后果。比如进程的 pid 已经被重新分配给其他进程，那么 signal 还是会发送到该进程，但这会产生意外的结果。

虽然这个方法名称叫 kill，但传给子进程的 signal 实际上可能不会终止该进程。

#### subprocess.unref()

默认，父进程会等待已分类的子进程退出。如果不想让父进程等待子进程退出，可以使用 `subprocess.unref()`。调用这个方法后，父进程的 event loop 将不会在其引用计数中包含子进程，从而允许父进程独立于子进程而退出，除非子进程与父进程之间已建立了 IPC 通道

```js
const { spawn } = require('child_process');

const subprocess = spawn(process.argv[0], ['child_program.js'], {
  detached: true,
  stdio: 'ignore'
});

subprocess.unref();
```

#### subprocess.ref()

在调用 subprocess.unref() 之后调用 subprocess.ref() 会恢复子进程的引用计数，强制父进程在退出前等子进程的退出。

#### subprocess.send(message[, sendHandle[, options]][, callback])

+ message `<Object>`
+ sendHandle `<Handle>`
+ options `<Object>` is an object used to parameterize the sending of certain types of handles. options supports the following properties:
   + keepOpen `<boolean>` A value can be used when passing instances of net.Socket. when true, the Socket is kept open in the sending process. ***Default:*** false
+ callback `<Function>`
+ Returns: `<boolean>`

当父子进程之间已经建立了 IPC channel (例如，使用 `child_process.fork()`), `subprocess.send()` 方法可以用来向子进程发送消息。如果子进程是 Node.js 实例，发送的消息可以通过 'message' 事件监听器接收。

```js
const { fork } = require('child_process');
const subprocess = fork(`${__dirname}/sub.js`);
subprocess.on('message', message => {
  console.log('Parent got message: ', message)
})
subprocess.send({ hello: 'world' });
```

```js
process.on('message', message => {
  console.log('Child got message:}', message);
})

process.send({ foo: 'bar', baz: NaN });
```

子进程可以通过 `process.send()` 向父进程发送消息。

如果 message 是 **{cmd: 'NODE_foo'}**, 其中 cmd 属性值包含 NODE_ 前缀，这种消息是预留给 Node.js 内部使用，将不会触发 'message' 事件。这种消息可以通过监听 'internalMessage' 获取，且会被 Node.js 内部消费。对于应用程序而已，应该避免使用这类 message 并且不要监听  'internalMessage' 事件，因为这个可能会被更改导致事件没有被触发。

sendHandle 参数可用于将 TCP Server 或者 socket 对象传递给子进程。子进程会在 'message' 事件处理函数的第二个参数里得到该参数值，在 socket 中接收和缓冲的任何数据都不会传送给子进程。

如果 IPC channel 已关闭，或者未发送的消息积压超过阈值使得无法发送更多数据时，subprocess.send() 将会返回 false。否则返回 true。

### 属性

#### subprocess.connected

+ `<boolean>` 当调用 subprocess.disconnect() 后，这个值会被设为 false

这个属性表明是否可以从 child process 发送或者接收消息。当这个属性值为 false，就不能再发送或接收消息。

#### subprocess.exitCode

+ `<integer>`

这个属性表明子进程的 exit code。如果子进程还在运行，这个值就会 null.

#### subprocess.killed

+ `<boolean>` 当使用 `subprocess.kill()` 成功发送 signal 到子进程后，这个值会被设置为 true。

这个属性只表明子进程是否成功收到 subprocess.kill() 的 signal，并不能表明子进程是否已经终止。

#### subprocess.pid

+ `<integer>`

返回子进程的 pid

#### subprocess.signalCode

+ `<integer>`

这个属性表明子进程接收到的 signal number。如果没有就返回 null

#### subprocess.spawnargs

+ `<Array>`

这个属性代表子进程被启动时的完整命令行参数

#### subprocess.spawanfile

+ `<string>`

这个属性表明子进程被启动所使用的可执行文件名称：
+ 对于 fork()  这个属性值等于 process.execPath
+ 对于 spawn() 这个值等于可执行文件名称
+ 对于 exec() 这个值等于启动子进程的 shell 名称

### subprocess.stdio

+ `<Array>`

一个到子进程的管道数组，对应于传给 `child_process.spawn()` 被设置为 'pipe' 值的 stdio 选项。`subprocess.stdio[0]`, `subprocess.stdio[1]`, `subprocess.stdio[2]` 分别可用做 subprocess.stdin, subprocess.stdout, subprocess.stderr。

```js
const assert = require('assert');
const fs = require('fs');
const { spawn } = require('child_process');

const subprocess = spawn('ls', {
  stdio: [
    0, // use parent's stdin for child
    'pipe', // pipe child's stdout to parent
    fs.openSync('err.out', 'w') // Direct child's stderr to a file.
  ]
});

assert.strictEqual(subprocess.stdio[0], null);
assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

assert(subprocess.stdout);
assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

assert.strictEqual(subprocess.stdio[2], null);
assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
```

#### subprocess.stdin

+ `<stream.Writable>`

表示子进程的 Writable Stream。如果子进程被 spawn 时 stdio[0] 被设置为 'pipe' 以外的任何值，那么该值就是 null。subprocess.stdin 其实是 subprocess.stdio[0] 的别名

#### subprocess.stdout

+ `<Stream.Readable>`

表示子进程 stdout 的可读流。如果子进程被 spawn 时 stdio[1] 被设置为 'pipe' 以外的任何值，那么该值就是 null. subprocess.stdout 其实是 subprcess.stdio[1] 的别名。

#### subprcess.stderr

+ `<Stream.Readable>`

表示子进程 stderr 的可读流。如果子进程被 spawn 时 stdio[2] 被设置为 'pipe' 以外的任何值，那么该值就是 null。subprocess.stderr 是 subprocess.stdio[2] 的别名。




