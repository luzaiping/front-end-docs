net
====================

这个模块用于创建基于 stream 的 TCP 或 IPC 服务器 (`net.createServer()`) 与客户端 (`net.createConnection()`)

## net.Server

继承于 `<EventEmitter>`, 这个类用于创建 TCP 或 IPC 服务器。

### 创建 TCP/IPC 服务器

#### net.createServer([options][,connectionListener])

+ options `<Object>`
   + allowHalfOpen `<boolean>` Indicates whether half-opened TCP connections are allowed. ***Default***: false.
   + pauseOnConnect `<boolean>` Indicates whether the socket should be paused on incoming connections. ***Default:*** false
+ connectionListener: `<Function>` Automatically set as a listener for the 'connection' event.
+ Returns `<net.Server>`

这个方法是创建 TCP 或 IPC server 的最常见用法。具体创建的是什么类型的 server，由 `listen()` 方法决定。

如果 allowHafOpen 被设置为 true，当 socket 的另一端发送 **FIN** packet, server 在 `socket.end()` 被显示调用时将仅发回 **FIN** packet，之后 connection 就处于 half-opened 状态 (可写但不可读)

如果 pauseOnConnect 被设置为 true，则每个与 sokect 相关的 incoming connection 都会被暂停，将无法从对应的 handle 中读取到数据。这允许在进程之间传递 connection 对象，而不会导致原始进程读取任何数据。通过调用 `socket.resume()` 可以让暂停的 socket 开始读取数据。

```js
const net = require('net');

const server = net.createServer((socket) => {
  // 这个是 connectionListener，会自动注册到 server.on('connection')
  // 也可以直接写在 server.on('connection', handler) 里
  console.log('client connected.');

  socket.on('data', data => {
    console.log('incoming data:', data.toString());
  });

  // 当 socket 的另一端 (客户端) 发送 'FIN' packet
  // end 事件会被触发
  socket.on('end', () => {
    console.log('client disconnected.');
  });

  socket.write('hello\r\n');
  socket.pipe(socket); // socket 是一个 Duplex stream，因此可以直接 pipe
});

server.on('error', err => {
  throw err;
});

// 监听一个 port，即最终要创建的是 TCP server
server.listen(8124, () => {
  // 这个 listener 会自动注册到 server.on('listening') 事件里
  console.log('server bound.');
});

// 下面要来监听一个 unix domain socket (IPC server 的一种具体实现机制)
server.listen('/tmp/echo.sock', () => {
  console.log('server bound.');
});

// 可以通过 nc -U /tmp/echo.sock 连接到这个 IPC server
```

#### new net.Server([options][, connectionListener])

这个方法的参数 options 和 connectionListener 和 net.createServer() 是一样。最终也是返回一个 `net.Server` 对象。（个人猜测 createServer 是一个工厂方法，内部直接调用了 `new net.Server()`)。

`new net.Server()` 和 `net.createServer()` 都只是创建一个 *net.Server* 对象，这个对象表示一个服务器抽象对象，服务器可以是 TCP 服务器，也可以是 IPC 服务器，具体取决于 `listen()` 监听的是什么类型；调用了 `listen()` 之后，服务器类型就确定了，之后才能决定如何连接 server，也才能接收 connection。

### 事件

+ close：当 server 关闭时触发。如果有 connections 存在，会等到所有 connections 结束时才触发这个事件。
+ connection：当一个新的 connection 创建时会触发。对应的 hanlder 接收一个 net.Socket 对象，使用这个 socket 对象可以跟 client 通信。net.createServer() 如果提供了 connectionListener，会自动注册一个 connection 事件。
+ error：当有错误发生时触发。接收一个 Error 对象参数。不同于 net.Socket，这个事件触发后并不会紧接着触发 close 事件，除非显示调用 server.close() 才会触发 'close' 事件。
+ listening：当调用 `server.listen()` 后触发这个事件。如果为 `server.listen()` 提供了 callback 函数，那么会自动注册 callback 为 handler 的 listening 事件

### 方法

+ server.address() 如果 server 是在 IP socket 上监听就返回操作系统所绑定的 address，family，port 比如 `{port: 12345, 'family': 'IPv4', address: '127.0.0.1'}`; 如果是在 piped 或 unix domain socket 监听，就返回字符串。__注意__ 在 'listening' 触发之前，或在调用 `server.close()` 之后，server.address() 返回 null
+ server.close() 调用这个方法之后会阻止 server 接收新的 connections 并保持现有 connection。这个方法是异步，server 会在所有 connections 都结束后关闭并触发 'close' 事件。可选的 callback 参数，将在 'close' 事件发生时执行。
+ server.getConnections(callback) 异步获取当前 server 的并发 connections 数。
+ server.unref() 如果 server 是当前 event system 中唯一 active server，调用这个方法后将允许 program 退出；已经调用 unref(), 再次调用 unref() 是无效
+ server.ref() 如果之前已经调用了 unref(), 调用 ref() 后，即使当前 server 是唯一 active server，program 也不会退出。重复调用 ref() 是无效。

#### server.listen()

这个方法用于启动 server 以监听 connections。可能的方法签名包括：
+ server.listen(handle [,backlog][, callback])
+ server.listen(options [, callback])
+ server.listen(path [,backlog][, callback]) 用于监听 IPC 服务器。
+ server.listen([port[, host[, backlog]]][, callback]) 用于监听 TCP 服务器

所有方法都是异步，当 server 开始监听时，'listening' 事件会被触发。如果提供了 callback，这个函数会被添加为 'listening' 的 event。

所有方法都接收 backlog 参数，这个参数用于指定 the maximum length of the queue of pending connections.(待连接队列的最大长度)

这个方法只有在首次调用出现错误或者调用 `server.close()` 之后才可以再次调用，否则会抛出 'ERR_SERVER_ALREADY_LISTEN' 错误。

调用这个方法最常见的错误是 'EADDRINUSE'。这个通常是由于其他 server 已经在监听对应的 port/path/handle。处理这个问题的一种方法是在一段时间后重试

```js
server.on('error', (e) => .{
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(PORT, HOST) // 这个以 TCP 为例
    }, 1000);
  }
})
```

## net.Socket

+ Extends `<stream.Duplex>`

这个类是一个 TCP Socket 或者 streaming IPC endpoint (use named pipes on Windows, and Unix domain sockets otherwise)

net.Socket 可以由用户创建并且直接跟 server 交互。比如通过 `net.createConnection()` 方法返回的 socket 对象，可以用来直接跟 server 通信。

也可以由 Node.js 创建，并且在接收到 connection 时将 socket 对象传递给应用程序。比如，net.Server 的 'connection' 事件处理函数的入参 socket，使用这个 Node.js 创建的 socket，允许 server 跟 client 进行通信。

这个对象是 server 和 client 通信的核心，后续通信基本都是调用这个对象上的方法。

### 创建

#### new net.Socket([options])

+ options `<Object>` 包含的选项有：
   + fd `<number>` 如果指定的话，会使用给定的 fd 包装一个 existing socket。否则的话，会创建一个新的 socket。
   + allowHalfOpen 跟 net.Server 的选项一样
   + readable `<boolean>` 当传递了 fd 时是否允许读取 socket，默认是 false
   + writable `<boolean>` 当传递了 fd 时是否允许写入 socket，默认是 false
+ Returns `<net.Socket>`

用于创建一个新的 socket 对象；新创建的 socket 可以是 TCP socket 或者 streaming IPC endpoint；具体是哪种类型由 `socket.connect()` 决定。

#### net.createConnection()

这是个用于创建 **net.Socket** 的工厂方法; 这个方法会先创建一个 socket，之后立即调用 `socket.connect()` 初始化 connection，最终返回新创建的 socket 对象。等同于下面代码

```js
const socket = new net.Socket();
socket.connect();
```

这个也是创建 client 端 socket 的最常见用法。

当 connection 被建立后，在返回的 socket 对象上就会触发 'connect' 事件。如果指定了 `net.createConnection()` 方法的最后一个参数 connectListener, 那么会自动注册 'connect' 事件。

这个方法有3中方法签名：
+ net.createConnection(options[, connectListener])
+ net.createConnection(path[, connectionListener]) 用于创建 IPC connections
+ net.createConnection(port[, host][, connectionListener]) 用于创建 TCP connections

#### net.connect()

这个是 net.createConnection() 的别名


从上面的创建方式可知，`new net.Socket()` 只是创建一个 *net.Socket* 对象，但还没创建 connection，需要通过 `socket.connect()` 才能创建 connection 并连接到 server，通常并不需要使用显示调用 `socket.connect()` 方法，一般仅在实现自定义的 socket 时才会使用这个方法。

由于创建 socket 通常就是要连接，因此 Node.js 提供了一个工厂方法，用于创建 socket 并连接：`net.createConnection()`。另外还有一个 `net.connect()`，这个方法是 `net.createConnection()` 的别名。

### 事件

+ close：当 socket 被完全关闭时触发。事件 handler 接收一个 hadError 参数，如果 socket 是由于传输错误导致关闭的话，这个值就为 true，否则为 false。
+ connect：当一个 socket connection 成功创建时触发。
+ data：当接收到数据时触发。如果没有指定这个事件的 listener，数据就会丢失掉。listener 的参数 data 可以是 Buffer 或 string 类型。Encoding 可以由 `socket.setEncoding()` 设置
+ drain: 当 the write buffer 为空时触发。这个可以用来 throttle uploads。(比如上传的数据写入比接收的读取速度快，那么会导致 buffer 无法继续写入，因此要等 buffer 清空时再继续写入)
+ end：当 socket 另一端发送一个 'FIN' packet 时触发，触发后会结束当前 socket 的 readble。默认情况下，socket 触发这个事件后，会向另一端发会 'FIN' packet，并且一旦 write out its pending write queue 后，会销毁掉 fd。不过如果 allowHalfOpen 设置为 true，socket 就不会自动结束它的 writable，这会允许触发了 close 事件后，还可以继续写入任意数量的数据，只有显示调用 end() 方法后才会关闭 connection。
+ error：当错误发送时触发。close 事件会紧跟着触发。这个跟 net.Server 是不同。
+ lookup：在 resolving host name 之后，创建连接之前触发。这个仅对 TCP socket 有效。
+ ready：Emitted when a socket is ready to used. 在 'connect' 之后立即触发

### 属性

+ socket.bytesRead: 已接收的字节数量
+ socket.bytesWritten: 发送的字节数量
+ socket.connnecting: 调用 `socket.connect()` 但是还没结束时就为 true，一旦连接成功了就为 false，即触发了 'connect' 事件后，这个值就会false。这个状态应该是很短暂
+ socket.destroyed: 指示 connection 是否已经被销毁。
+ socket.remoteAddress / socket.remotePort / socket.remoteFamily: 远程 socket 所对应的 ip，port 和 IP family (IPv4 / IPv6)
+ socket.localAddress / socket.localPort: 本地 socket 的 ip 和 port

### 方法

+ socket.address()：返回操作系统 report 的 socket address，port，family
+ socket.destroy(): 确保当前 socket 没有 I/O activity. Destory stream and closes the connection.
+ socket.end(): Half-close the socket. 比如发送一个 FIN packet. server 仍可以继续发送数据。如果指定了 data 参数，相当于是调用 socket.write() 再调用 socket.end() 
+ socket.pause() : 调用 pause() 将会暂停读取数据，即 'data' 事件不会再触发。可以用于 upload 节流
+ socket.resume()：在调用 pause() 之后恢复读取数据，再次触发 'data' 事件。
+ socket.connect(): 在给定的 socket 上启动连接。通常不需要显示调用这个方法。