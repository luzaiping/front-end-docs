UDP/datagram
================

dgram 模块提供了 UDP (User Datagram Protocol) datagram sockets

```js
const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('error', err => {
  console.log(`server error:\n ${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  const { address, port } = server.address();
  console.log(`server listening ${address}:${port}`);
});

server.bind(41234);
```

## 创建

dgram.Socket 该类封装了 datagram 功能, 继承于 **EventEmitter**，而不是 **stream.Duplex**。类实例应该使用 `dgram.createSocket()` 创建，而不能使用 **new** 的方式创建。

### dgram.createSocket(options[, callback])

+ options `<Object>` 可用的选项包括：
   + type：`<string>` The family of socket. 值必须是 'udp4' 或 'udp6', 这个选项是必填
   + reuseAddr `<boolean>` 当值为 true, 调用 `socket.bind()` 会重用 address，哪怕其他进程已经在这个 address 上绑定了 socket。默认为 false
   + ipv6Only `<boolean>` 当值为 true，将会禁用 dual-stack support, 比如绑定到 address :: 不会使得 0.0.0.0 也被绑定。默认为 false
   + recvBufferSize `<number>` 设置 **SO_RCVBUF** socket value
   + sendBufferSize `<number>` 设置**SO_SNDBUF** socket value
   + lookup `<Function>` 自定义 lookup 函数，默认使用 dns.lookup()
+ callback `<Function>` 为 message 事件 (区别于 net 模块是为 connection/connect 事件) 绑定一个 listener。可选参数
+ Returns `<dgram.Socket>`

该方法用于创建 dgram.Socket 对象。一旦 socket 被创建。

+ 调用 `socket.bind()` 会指示 socket 开始监听 datagram message，相当于一个 server 的功能. 如果 `socket.bind()` 没有指定 address 和 port，这个方法会将 socket 绑定到 'all intefaces' address on random port. 绑定的 address 和 port 可以通过 `socket.address().address` 和 `socket.address().port` 获取。

+ 调用 `socket.connect()` 会连接到指定的 socket，相当于一个 client 的功能。

### dgram.createSocket(type[, callback])

这个方法是上面方法的简写形式而已，最终还是会调用上面的方法来创建 **dgram.Socket** 对象。

### 事件

+ close：这个在使用 `socket.close()` 关闭一个 socket 后就触发。一旦事件触发后，这个 socket 就不会再触发新的 'message' 事件
+ connect：在成功调用 `socket.connect()` 使得 socket 跟远程 address 关联之后被触发
+ error：当任何错误发生时触发该事件，handler 只接收一个 Error 对象
+ listening：每当 dgram.socket is addressable 并且可以接收数据时，会触发该事件。这个事件发生在，显示调用 `socket.bind()`、或使用 `socket.send()` 发生第一条数据时。在 dgram.socket 开始监听之前，底层的系统资源并不会存在，调用 `socket.address()` 或 `socket.setTTL()` 都会导致失败。
+ message 当有新的 datagram 被 socket 接收时触发该事件。event handler 会接收到如下两个参数：
   + msg `<Buffer>` 具体 message
   + rinfo `<Object>` Remote address information
      + address `<string>` the sender address
      + family `<string>` the address family (IPv4 or IPv6)
      + port `<number>` the sender port
      + size `<number>` the message size

### 属性

dgram.Socket 对象没有任何属性，全部是方法。

### 方法

#### socket.address()

+ Returns `<Object>`

返回一个包含 address information for the socket. 对于 UDP sockets，这个对象会包含 address, family, port。

如果在一个 unbound socket 上调用这个方法，会抛出 **EBADF** 错误

#### socket.bind(options[, callback])

+ options `<Object>` 必填参数，包含如下属性：
   + port `<integer>`
   + address `<string>`
   + exclusive `<boolean>`
+ callback `<Function>` 没有参数。当绑定完成时会调用这个 callback

这个方法会令 *dgram.Socket* 在指定的 port 和可选的 address 上监听数据包信息。如果 port 没有指定或者值为 0，操作系统会尝试绑定一个随机的端口；如果 address 未指定，操作系统会尝试在所有地址上监听。一旦绑定成功，'listening' 事件会被触发，如果指定了 callback，callback 也会被调用。同时指定 'listening' 和 callback 不会带来坏处，但也没多大用处。

在配合 cluster 模块使用 dgram.Socket 对象时，options 可能会包含 exclusive 选项。这个选项如果设置为 false (默认值)，cluster workers 会使用相同的 socket handle 来共享连接处理作业。值为 true 时，handle 就不会被共享，如果尝试共享 port，会导致错误发生。

如果指定了 fd 选项，并且值大于 0，将会使用给定的 fd 封装一个现有的 socket。这种情况，port 和 address 属性会被忽略。

一个绑定的的 datagram socket 会让 Node.js 进程持续运行以接收数据报信息。

绑定失败，会导致触发 error 事件。在极少数情况下 (比如尝试绑定一个已经关闭的 socket)，一个 Error 对象可能被抛出。
```js
socket.bind({
  port: 8000,
  address: 'localhost',
  exclusive: true
})
```

### socket.bind(port[, address][, callback])

这个是上面方法的特殊形式，只允许设置 port，address 和 callback。

### socket.close([callback])

+ callback `<Function>` 当 socket 被关闭时调用

这个方法用于关闭底层的 socket 并且停止监听数据。如果提供了 callback，相当于为 'close' 事件添加了一个 listener。

### socket.connect(port[, address][, callback])

+ port `<integer>`
+ address `<string>`
+ callback `<Function>` 当 connection 完成或者出错时被调用

为 dgram.socket 关联一个远程的 address 和 port。由这个 handle 发送的任何消息都会自动被发送 destination，并且这个 socket 只接收来自于这个 remote peer 的消息。

尝试在一个已连接的 socket 上调用 connect() 会导致 ***ERR_SOCKET_DGRAM_IS_CONNECTED*** 错误。如果没有指定 address，默认会使用 '127.0.0.1' (udp4) 或 '::4' (udp6)。一旦连接成功， 会触发 'connect' 事件，如果指定了 callback 参数，callback 会被调用。

这个方法会让 socket 连接另外一个 socket。从实际应用中来看，这个类似于一个 client 的角色。

### socket.disconnect()

这是一个同步方法，会断开一个已经同远程地址创建连接的 socket。在一个未绑定或者已断开连接的 socket 上调用这个方法会导致 `ERR_SOCKET_DGRAM_NOT_CONNECTED` 异常。

### socket.getRecvBufferSize() / socket.setRecvBufferSize(size)

获取和设置 socket 接收到消息的 buffer 大小，以字节为单位。

### socket.getSendBufferSize() / socket.setSendBufferSize(size)

获取和设置 socket 发送消息的 buffer 大小，以字节为单位。

### socket.ref() / socket.unref()

### sokcet.send(msg[,offset, length][,port][,address][,callback])

+ msg `<Buffer>` | `<TypedArray>` | `<DataView>` | `<string>` | `<Array>` 要发送的消息
+ offset `<integer>` 指定消息的开头在 buffer 中的起始位置
+ length `<integer>` 消息中的字节数
+ port `<port>` 目标端口
+ address `<string>` 目标主机名或IP地址
+ callback `<Function>` 当消息被发送时调用

在 socket 上广播一个数据包。如果该 socket 还没有连接过，那么必须指定目标 port 和 address。对于已连接的 socket，会使用关联的 remote endpoint，因此不能设置 port 和 address 参数。

如果 msg 是一个 Buffer、TypedArray 或 DataView，则 offset 指定了消息在 Buffer 中的偏移量，length 指定了字节数。如果 msg 是一个字符串，会自动使用 UTF-8 将字符串解码成 Buffer。如果 msg 包含多字节字符，offset 和 length 是根据字节长度进行计算，而不是根据字符长度进行计算。如果 msg 是 Array，那么 offset 和 length 一定不能指定。offset 和 length 是可选参数，但是一旦其中一个被指定，那么另外一个也必须被指定。

确定数据包被发送的唯一发送是指定 callback。若在 callback 被指定的情况下有错误发生，该错误会作为 callback 的第一个参数。如果没有 callback，会触发 error 事件，错误会被作为 error 事件 handler 的入参。

```js
const dgram = require('dgram');
const message = Buffer.from('Some bytes');
const client = dgram.createSocket('udp4');
client.send(message, 41234, 'localhost', (err) => {
  client.close();
});

// 也可以先连接再发送
client.connect(41234, 'localhost', (err) => {
  client.send(message, error => {
    client.close();
  })
})
```

### socket.setBroadcast(flag)

+ flag `<boolean>`

设置或清除 **SO_BROADCAST** socket 选项。当设置为 true，UDP packet 可能会被发送到一个本地接口的 broadcast address。


