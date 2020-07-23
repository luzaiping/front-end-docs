cluster

=========================

## Cluster 类

### 事件

#### disconnect 事件

+ worker `<cluster.Worker>`

这个事件在 worker 的 IPC channel 被断开后触发。可能导致事件触发的原因有：worker 正常退出、被 killed、或者手动端口链接（比如调用了 `worker.disconnect()`）

'disconnect' 和 'exit' 事件之间可能存在延迟。这些事件可以用来检测进程是否在清理过程中被卡住，或者是否存在长期运行的连接。

```js
cluster.on('disconnect', (worker) => {
  console.log(`The worker #${worker.id} has disconnected.`);
})
```

#### exit 事件

+ worker `<cluster.Worker>`
+ code `<number>` exit code, if it existed normally.
+ signal `<string>` The name of the signal(eg. 'SIGHUP') that caused process to be killed.

当任何一个 worker 关闭的时候，cluster 模块就会触发 'exit' 事件。通常可以在该事件里通过 `.fork()` 重启新的 worker

```js
cluster.on('exit', (worker, code ,signal) => {
  console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code);
  cluster.fork();
})
```

#### fork 事件

+ worker `<cluster.Worker>`

当一个新的 worker 被 fork，cluster 模块就会触发 'fork' 事件。这个可以用来记录 worker activity，并创建自定义的 timeout

```js
const timeouts = [];

const timeoutCallback = () => {
  console.error('Something must be wrong with the connection ...');
}

cluster.on('fork', (worker) => {
  timeouts[worker.id] = setTimeout(() => {
    timeoutCallback();
    worker.disconnect();
  }, 2000);
  console.log(`New worker is forked: ${worker.id}`);
});

cluster.on('online', (worker) => {
  console.log('==== online ====');
  clearTimeout(timeouts[worker.id]);
});

cluster.on('exit', (worker) => {
  console.log(`worker #${worker.id} exited`);
  clearTimeout(timeouts[worker.id]);
})
```

#### listening 事件

+ worker `<cluster.Worker>`
+ address `<Object>`

当在一个 worker 里调用 `listen()` 后(其实调用的是 server.listen() 即 worker 的 server 开始监听服务)，worker 上的 server 会触发 'listening' 事件，同时 master 上 cluster 也会触发 'listening' 事件

事件处理函数的 address 参数是一个对象类型，包含了以下连接属性：address, port, addressType。当 worker 同时监听多个地址时，这些参数就非常有用：

```js
cluster.on('listening', (worker, address) => {
  console.log(`A worker is now connected to ${address.address}:${address.port}`);
})
```

addressType 可选值包含：
+ 4 (IPv4)
+ 6 (IPv6)
+ -1 (Unix domain socket)
+ 'udp4' or 'udp6' (UDP v4 or v6)

#### message 事件

+ worker `<cluster.Worker>`
+ message `<Object>`
+ handle `<undefined>` | `<Object>`

当 cluster master 从任何一个 worker 上接收到 message 时会触发该事件。

这个事件的调用具体情况跟 child_process 的 'message' 事件一样。

#### online 事件

+ worker `<cluster.Worker>`

当 fork 一个 work 之后，worker 应当响应一个 online message。当 master 接收到 online message 之后会触发 online 事件。'fork' 和 'online' 事件的区别是，当 master fork worker 后就会触发 'fork' 事件，而当 worker 运行时才会触发 'online' 事件。

```js
cluster.on('online', (worker) => {
  console.log('Yay, the worker responded after it was forked');
});
```

#### setup 事件

+ setting `<Object>`

调用 `.setupMaster()` 时会触发这个事件。

setting 对象是调用 `.setupMater()` 时 cluster.setting 的值。

### 方法

#### cluster.disconnect([callback])

+ callback `<Function>` 当所有 workers 断开连接并且所有 handles 都关闭时，会调用 callback

这个方法只能在 master 上调用，执行后会在 cluster.workers 的每一个 worker 上调用 `.disconnect()`。

#### cluster.fork([env])

+ env `<Object>` 要添加到 worker process 环境变量的对象
+ Returns：`<cluster.Worker>`

生成一个新的 worker process。这个只能在 master 上调用。

#### cluster.setupMaster([settings])

+ setting `<Object>` cluster.setting 对象

这个是用于修改默认的 `.fork()` 行为。调用这个方法后，settings 参数值就会存在于 cluster.settings 中

settings 只对后续调用 `.fork()` 产生的 worker 有效；对已 forked 的 worker 无效。

这个方法无法修改 .fork(env) 的 env 参数信息。这个方法只能在 master 上调用。

```js
const cluster = require('cluster');
cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'https'],
  silent: true
});

cluster.fork(); // https worker

cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'http']
});

cluster.fork(); // http worker

```

### 属性

#### cluster.isMaster

+ `<boolean>`

True if the process is master. 这个是由 ***process.env.NODE_UNIQUE_ID*** 决定。如果 ***process.env.NODE_UNIQUE_ID*** 是 undefined，那么 isMaster 就是 true。

#### cluster.isWorker

+ `<boolean>`

True if the process is not master. (it is the negation of cluster.isMaster)

#### cluster.schedulingPolicy

todo

#### cluster.settings

+ `<Object>`

当调用 `.setupMaster()` 或 `.fork()` 之后，这个对象会包含一组默认配置项，并且设置了默认值 (除非调用 .setupMaster() 提供了新的 setting 进行覆盖)

通常不应该修改这个值。

#### cluster.worker

+ `<Object>`

指向当前 worker 对象，这个在 master 上是无效。

```js
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('I am master');
  cluster.fork();
  cluster.fork();
} else {
  console.log(`I am worker #${cluster.worker.id}`);
}
```

#### cluster.workers

+ <Object>

这个是一个包含了所有 active worker 的对象，其中属性值是 worker id。这个只在 master 上有效。

当 worker disconnected 或者 exited，worker 会从 workers 中移除。'disconnected' 和 'exited' 这两个事件的触发顺序是不固定，但可以保证的是移除操作一定是在最后一个事件被触发前完成。

## Worker 类

A worker 对象包含了一个 worker 的所有公告信息和方法。在 master 里可以通过 `cluster.workers` 得到所有 worker 对象；在 worker 里可以通过 `cluster.worker` 得到当前 worker 对象。

### 事件

#### disconnected 事件

类似于 `cluster.on('disconnected')`, 但只特定于当前进程。注意这个事件函数没有 worker 参数

```js
cluster.fork().on('disconnected', () => {
  // worker has disconnected
})
```

#### error 事件

这个事件跟 `child_process.fork()` 提供的事件相同。

在 worker 里，也可以使用 process.on('error') 监听

#### exit 事件

+ code `<number>` exit code, if it exited normally.
+ signal `<string>` signal name that caused the process to be killed.

类似于 `cluster.on('exit')` 事件，但仅特定于当前进程

```js
const worker = cluster.fork();
worker.on('exit', (code ,signal) => {
  if (signal) {
    console.log(`worker was killed by signal: ${signal}`);
  } else if (code !== 0) {
    console.log(`worker exited with error code: ${code}`);
  } else {
    console.log('worker exited successfully.');
  }
})
```

#### message 事件

类似于 `cluster.on('message')` 事件。 在 worker 里，也可以使用 `process.on('message')`

```js
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  function messageHandler({ cmd } = {}) {
    if (cmd && cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  const cpus = require('os').cpus().length;

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  for (let id of Object.keys(cluster.workers)) {
    // listen message from worker.
    cluster.workers[id].on('message', messageHandler);
  }
} else {
  // Worker processes have a http server.
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
    
    // Notify master about the request.
    cluster.worker.send({ cmd: 'notifyRequest' });
    // cluster.worker
  }).listen(8000, () => {
    console.log('server is running...');
  });
}
```

#### online 事件

类似于 `cluster.on('online')`

```js
cluster.fork().on('online', () => {
  // worker is online
})
```

这个事件不会在 worker 中触发

### 方法

#### worker.disconnect()

+ Returns `<cluster.Worker>`

如果是在 worker 里调用，这个方法会关闭运行在该 worker process 上的所有 servers，之后等待这些 servers 触发 close 事件，然后再断开 IPC channel.

如果是在 master 里调用，会给 worker 发送一个内部消息，引起 worker 自身调用 `.disconnect()`

当一个 server 关闭后，它就不会再接收任何新的 connection，新的 connection 可以由其他正常开启监听服务的 worker 接收处理。当所有 connection 都关闭后，当前 worker 的 IPC channel 就会被关闭。

以上情况只针对 server connections，client connections 是不会被 worker 自动关闭，并且 worker 也不会等待 client connection 关闭后再退出。

由于长时间运行的 server connections 会导致 worker 无法正常退出，可以采取发送特定的消息，让应用采取相应的操作来关闭 connections。也可以通过设置 timeout，当指定 timeout 时间后还没触发 'disconnect' 就强制执行关闭操作：

```js
if (cluster.isMaster) {
  const worker = cluster.fork();

  let timeout;

  worker.on('listening', (address) => {
    console.log('==== receive work is listening ====');
    worker.send('shutdown'); // 向 worker 发送消息
    // worker.disconnect(); // 这个会在内部提示对应 worker 执行断开连接

    // 指定时间内，如果 worker 还没断开连接，就执行 kill 操作
    timeout = setTimeout(() => {
      console.log('==== reach timeout ====');
      worker.kill();
    }, 2000);
  });

  worker.on('disconnect', () => {
    console.log('==== disconnect ====');
    clearTimeout(timeout); // 如果已经断开了，就清除定时器
  });
} else if (cluster.isWorker) {
  const net = require('net');

  const server = net
    .createServer((socket) => {
      // connection never end
    });

  server.listen(7000, () => {
      console.log('server is listening on 7000');
    });


  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      console.log('worker receive message to shutdow.');
      // 接收到关闭消息，执行关闭操作
      // cluster.worker.disconnect(); // 这个会报错
      // server.close(); // 这个并没有关闭 worker
    }
  })
}
```

#### worker.isConnected()

This function return true if the worker is connected to its master via its IPC channel, false otherwise. worker 在被创建之后会自动连接到 master。当 disconnect 事件触发后，才会断开。

#### worker.isDead()

This function returns true if worker's process has terminated (either because of exiting or being signed). otherwise, it returns false.

#### worker.kill([signal])

This function will kill the worker. In the master, it does this by disconnecting the worker.process, and once disconnected, killing with signal. In the worker, it does it by disconnecting the channel, and then exiting with code 0.

#### worker.send()

### 属性

#### worker.id

+ `<number>`

Each new worker is given its own unique id, this id is stored in the worker.id

如果 worker is alive, id 也会存在于 cluster.workers 的索引里

#### worker.process

所有 workers 都是通过 `child_process.fork()` 创建，这个方法的返回的对象被存储在 worker.process 里。如果是在 worker process 里，直接访问 process 即可，因为 process 是全局对象。

```js
const cluster = require('cluster');
if (cluster.isWorker) {
  console.log(cluster.worker.process === process);
}
```

