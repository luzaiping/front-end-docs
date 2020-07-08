stream
==============

## 对象模式 (Object Modes)

Nodejs 创建的 Stream 都是用在 Buffer 或者 string 上。不过流的实现也可以使用其他类型的 javascript 值(null 除外)。这些流会以 对象模式 进行操作。

当创建流时，可以使用 objectMode 选项把流实例切换到对象模式。将已存在的流切换到对象模式是不安全。

## 流和缓冲

Writable 和 Readable 都会在 internal buffer 中存储数据，可以分别使用 writable.writableBuffer 或 readable.readableBuffer 来获取。

可缓冲的数据大小取决于传入流构造函数的 highwaterMark 参数。对于普通的流，highwaterMark 指的是字节的总数；对于对象模式的流，highwaterMark 指的是对象总数。

对于 readable, 当调用 push(chunk) 方法时，数据会被加到 readable 的 buffer 里。如果 readable 的消费者没有调用 read([size])，那么数据会一直保留在 buffer 里直到被消费。一旦内部的 Buffer 总大小达到了 highwaterMark 指定的阈值时，readable 会暂停从底层资源继续读取数据，直到 buffer 中的数据被消费了 (也就 readable 内部会停止调用用于填充 buffer 的 readable_read 方法)

对于 writable, 当调用 write(chuck) 方法时，数据会被加到 writable 对于的 buffer 里。当内部的 buffer 总大小小于 highwaterMark 设置的阈值时，调用 write() 会返回 true，表示可以继续添加数据；一旦内部 buffer 的总大小达到或超过 highwaterMark 时，write() 方法会返回 false。

Stream API 的主要目标，特别是 stream.pipe(), 是为了限制数据的 buffer 到可接受的程度，也就是读写速度不一致的源头和目的地不会压垮内存。(这句话的意思是由于数据读写速度不一样，通过使用 stream 可以控制过多的数据写入内存，进而大量占用内存。比如读写文件，直接使用 fs.readFile 或 fs.writeFile 是需要将数据全部写入内存，然后再转给目的地，而使用 Stream 可以做到批量处理)

对于 Duplex 和 Transform 都是可读又可写，所以它们各自维护着两个相互独立的内部 Buffer，分别用于读写和写入，这使得它们在维护数据时，读取和写入可以各自独立地运行。比如 net.Socket 实例是 Duplex 流，它的可读端可以读取从 socket 接收到的数据，而可写端则可以将数据写入 socket，因为数据写入到 socket 的速度可能比接收数据的速度快或慢，所以读写端可以独立地操作各自的 buffer。

## 使用 stream

### Readable

Readable 是对提供数据来源的一种抽象。不同的 Readable 处理不同的数据来源。比如 fs.createReadStream 用于处理数据源是文件的场景。常见的 Readable 有：

+ 客户端的 HTTP 响应：http.IncomingMessage，继承于 stream.Readable
+ 服务器的 HTTP 请求：http.IncomingMessage，继承于 stream.Readable
+ fs 的读取流：fs.ReadStream, 继承于 stream.Readable
+ zlib 流
+ crypto 流
+ TCP socket：net.Socket，继承于 stream.Duplex
+ 子进程 stdout 与 stderr: 继承于 stream.Readable
+ porcess.stdin：继承于 stream

所有 Readable 类都实现了 stream.Readable 类定义的接口 (即 _read 内部方法)

#### Two Reading Modes

Readable 有两种 Reading Modes：
+ flowing mode：数据自动从底层数据来源读取，并通过 EventEmitter 接口的事件尽可能快地提供给应用程序。比如 data 事件
+ paused mode：这种模式必须显示调用 stream.read() 读取数据块。通过监听 readable 事件，在事件 handler 中调用 read()

这2个 Reading Modes 跟 Stream 的 Object modes 是没有独立，互不影响。无论处于哪种 Reading Mode，Readable 都可以处于 Object Mode。

所有 Readable 开始都处于 Paused 模式，可以通过以下方式切换到 Flowing Mode：

+ 添加 `data` event handler
+ 调用 stream.resume() 方法
+ 调用 stream.pipe() 方法将数据发送到 Writable

Readable 可以通过以下方式从 Flowing Mode 切换回 Paused Mode：
+ 如果没有 pipe destinations，调用 stream.pause()；
+ 如果有 pipe destinations，移除所有 pipe destinations。调用 Readable.unpipe([destinations]) 可以移除多个 pipe destinations

只有提供了消费或者忽略数据的机制后，Readable 才会产生数据。如果消费的机制被禁用或移除，则 Readable 会停止产生数据。

为了向后兼容，移除 data 事件处理函数，并不会自动地暂停流。如果有管道目标 (Writable)，一旦目标变为 drain 状态并请求接收数据时，调用 stream.pause() 也不能保证 Readable 流会保持暂停模式。

如果 Readable 切换到 Flowing Mode，并且没有 Consumer 来处理数据，则数据将会丢失。比如调用了 readable.resume() 时，并没有监听 'data' 事件 或 移除 'data' handler.

添加 'readable' handler 会使得流自动停止流动，并通过 readable.read(size) 消费数据。如果 `readable` handler 被移除，且存在 `data` handler，那么流会再次 流动。

#### Three States

Readable 的两种 Reading Modes 是对 Readable 中更复杂的内部状态管理的一种简化抽象。

在任意时刻，Readable 会处于以下三种状态之一：
+ readable.readableFlowing === null
+ readable.readableFlowing === false
+ readable.readableFlowing === true

当 reading.readableFlowing 为 null 时，没有提供消费数据的机制，所以流不会产生数据。在这个状态下，监听 `data` 事件、调用 readable.resume()、或调用 readable.pipe() 都会使 readable.readableFlowing 切换为 true，Readable 开始产生数据并触发事件。

调用 readable.pause()、readable.unpipe()、或接收到 `backpressure` 则 readable.readableFlowing 会被设为 false，暂时停止事件流动但不会停止数据的产生。在这个状态下，为 `data` 事件绑定 handler 不会使得 readable.readableFlowing 切换到 true。

当 readable.readableFlowing 为 false 时，数据可能会堆积在 Readable 内部的缓冲中。

#### 选择一种接口风格

Readable 提供多种方法来消费流数据。开发者通常应该选择其中一个方法，不要在单个流使用多种方法。混合使用 on('data')、on('readable')、pipe() 或 async iterator 会导致不明确的行为。

建议优先使用 readable.pipe(), 因为它是消费流数据最简单的方式。如果需要精细地控制流数据的传递与产生，可以使用 EventEmitter、readable.on('readble')/readable.read() 或 readable.pause() / readable.resume()

```js
// 使用 readable 读取数据
const fs = require('fs');
const reader = fs.createReadStream('filePath');
reader.on('readable', function() {
  while (data = this.read()) {
    console.log(`当前读取的字节大小是：${data.length}`);
  }
})

reader.on('end', () => {
  console.log('数据读取完毕');
})
```

这个例子使用 readable 事件 & read() 读取指定的数据。this.read 每次读取的数据量最大是 64KB (65535 byte)， 因此必须使用 while 调用 this.read()，这样才能确保数据都被读取完。从这个例子可以看出，使用 Stream 可以分批读取数据到内存中，读取一部分后数据就可以将数据交给 Consumer 进行操作。(如果使用 fs.readFile 需要将整个文件内容都读取到内存后，才能执行 callback)

```js
// 使用 readable 读取数据
const fs = require('fs');
const reader = fs.createReadStream('filePath');
reader.on('data', (chunk) => {
  console.log(`当前读取的字节大小是：${chunk.length}`);
})

reader.on('end', () => {
  console.log('数据读取完毕');
})
```

这个例子通过监听 data 事件 获取数据，一旦有数据被 push 到 stream， data 事件就会被触发，因此就可以执行对应的 callback。同上面的例子类似，每次 callback 最多可以读取的字节大小是 65535，如果数据源(这个例子是 文件)的内容大小超过 64KB，那么会多次调用 callback。

#### 事件

+ close：当 Readable 或 对应的底层资源(比如文件描述符) 被关闭时会触发 close 事件。该事件表面不会再触发其他事件，也不会再发生操作。
+ data：当 Readable 将数据块传给消费者时触发。注意是数据从流转到消费者时触发，而不是数据转到 Readable 的buffer时触发。当调用 readable.read() 且有数据块返回时，也会触发 data 事件
+ end: 当 Readable 没有数据可以提供给消费者时触发。这个事件只有在数据被`完全`消费掉后才会被触发。要触发该事件，可以将流切换到 Flowing Mode, 或者返回调用 readable.read() 直到数据被消费完。
+ error：
+ pause：当调用 stream.pause() 并且 readableFlowing 不为 false 时，就会触发 pause 事件，即流当前是 Flowing Mode 时，调用 pause() 才会触发事件
+ readable：当有数据可从流中读取时，就会触发 readable 事件。当达到数据的尽头时，readable 事件也会被触发，这个触发会发生在 end 事件之前。readable 事件表面流有新的动态：要嘛有新的数据，要嘛到达流的尽头。对于前者，stream.read() 会返回可用的数据，对于后者，stream.read() 会返回 false。通常 readable.pipe() 和 'data' 事件的机制要比 'readable' 事件更容易理解。处理 'readable' 可能会造成吞吐量升高。如果同时使用 'readable' 事件和 'data' 事件，一旦流中有数据可以被读取，会优先触发 readable 事件，而 data 事件只有在调用了 readable.read() 方法时才会被触发；这种情景 readableFlowing 会返回 false。当移除 readable 事件，如果还有 data 事件，则流会切换为 Flowing Mode，即无需调用 resume() 也会触发 data 事件。
+ resume: 当调用 stream.resume() 并且 readableFlowing 属性是 false 时，才会触发 resume 事件

```js
const fs = require('fs');
const reader = fs.createReadStream('foo.txt');
reader.on('readable', () => {
  console.log(`读取的数据: ${reader.read()}`);
});

reader.on('end', () => {
  console.log('读取结束');
})
```
如果 foo.txt 的内容为空，上面这个例子会输出：
读取的数据: null
结束

即读取到内容结束也会触发一次 readable 事件，而且是在 end 事件之前。

#### 方法

+ isPause(): 返回 Readable 当前的操作状态。主要用于 readable.pipe() 底层的机制，一般无需直接使用该方法
+ pause(): 使 Flowing Mode 的 Readable 停止触发 'data' 事件，并切换出 Flowing Mode。任何可用的数据都会保留在内部 Buffer 中。如果存在 readable 事件，则 pause() 方法不起作用。
+ pipe(destination[, options]): 绑定 Writable 到 Readable，将 Readable 自动切换成 Flowing Mode，并将 Readable 的所有数据推送到 Writable。数据流会被自动管理，所以即使 Readable 更快，目标 Writable 也不会超负荷。可以在单个 Readable 上绑定多个 Writable。默认情况，当来源 Readable 触发 end 事件，目标 Writable 也会调用 stream.end() 结束写入。如果要禁用这种行为，可以将 options 的 end 设置为 false，这样目标 Writable 就会保持打开状态。如果 Readable 在处理期间发送错误，Writable 不会自动关闭，因此需要手动关闭每个流以防止内存泄漏。
+ read([size]): 从内部 Buffer 中拉取并返回数据。如果没有可读数据会返回 null。read() 方法应该只在 Pause Mode 中使用，在 Flowing Mode 中，这个方法会被自动调用直到内部 Buffer 中的数据都被读取完。在使用 read() 方法时，while 循环是必须，因为 readable 只有在 read() 返回 null 时才会再被触发，如果没有 while 循环，就不会持续读取数据。
+ resume(): 将暂停的 Readable 恢复触发 'data' 事件，并将流切换为 Flowing Mode。这个方法可以用来充分消耗流中的数据，而不对数据进行任何处理。当存在 readable 事件，resume() 方法不起作用。
+ setEncoding(encoding): 为从 Readable 中读取的数据设置 encoding
+ unpipe([destination]): 移除之前通过 pipe() 添加的管道 Writable，如果没有指定 destination，则移除所有管道。
+ unshift(chunk[, encoding])：将指定 chunk 反推回 Readable 的 Buffer 中。比如 chunk 是 null，那么就会终止继续从 Readable 读取数据。这个方法通常用于以下场景：有些被消费的数据需要再推回 Readable，这样这些数据可以传给其他消费者。一般需要用到 unshift()，可以考虑切换使用 Transfrom 流。

```js
const reader = getReadableStreamSomehow();
reader.on('data', (chunk) => {
  console.log(`接收到 ${chunk.length} 字节的数据`);
  reader.pause();
  console.log('暂停一秒钟');
  setTimeout(() => {
    console.log('数据重新开始流动');
    reader.resume();
  }, 1000);
})
```

```js
const fs = require('fs');
const fileReader = fs.createReadStream('file.txt');
const zlibStream = zlib.createGzip();
const fileWriter = fs.createWriteStream('file.txt.gz');
fileReader.pipe(zlibStraeam).pipe(fileWriter); // pipe 会返回目标 Writable, 如果目标也是 Readbale，那么就可以链式调用 pipe
```

### Writable

Writable 是对数据要被写入的 destination 的一种抽象。这句话听起来有点抽象，说白点就是负责将数据(数据源可以是任意)写入到一个 destination 中，Writable 只是一个抽象的接口，不同的 destination 有不同的 Writable 子类实现。比如 fs 的写入流，由 fs.createWriteStream() 返回，这个流负责将数据写入到文件中。这边 文件 就是一个 destination。常见的 Writable 例子包括：
+ 客户端的 HTTP 请求： http.ClientRequest 继承 Stream
+ 服务器的 HTTP 响应： http.ServerResponse 继承 Stream
+ fs 的写入流：fs.WriteStream 继承 stream.Writable
+ zlib 流
+ crypto 流
+ TCP Socket: net.Socket 继承于 stream.Duplex
+ 子进程的 stdin
+ process.stdout / process.stderr

尽快 Writable 的具体实例可能会有差别，但所有的 Writable 都遵循同一基本的使用模式，如以下所示：

```js
const myStream = getWritableStreamSomehow();
myStream.write('一些数据');
myStream.write('更多数据');
myStream.end('完成写入的数据');
```

#### 事件

+ close：当流或底层资源(比如 文件描述符) 被关闭时会触发。
+ drain: 当调用 write(chunk) 返回 false，即内部 buffer 已经满了，不能继续写入数据；等 buffer 里的数据都刷新到 destination 时，即 buffer 允许再写入时，就会触发 drain 事件；这2个条件都必须满足才会触发。
+ error：写入数据 或者 pipe 数据时发送错误时会触发
+ finish：调用 writable.end() 且 buffer 中的数据都已传给底层系统之后会触发。可以单独监听这个事件，也可以在 end() 方法中指定 callback，这个 callback 就是 finish 事件的 handler
+ pipe：当在 readable 上调用 pipe() 时，会发出 pipe 事件
+ unpipe：当在 readable 上调用 unpipe() 时会发出 unpipe 事件，这会将 writable 从 readable 的管道目标集中移除。当通过管道向 writable 写入数据发生错误，也会触发 unpipe 事件

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();

writer.on('pipe', (src) => {
  console.log('something is piping into the writer.');
  assert.equal(src, reader);
});

writer.on('unpipe', (src) => {
  console.log('Something has stopped piping into the writer.');
  assert.equal(src, reader);
});

reader.pipe(writer);
reader.unpipe(writer);
```

#### 方法
+ cork(): 这个方法强制将所有写入的数据都缓冲到内存中。当调用 uncork() 或 end 方法时，缓冲的数据就会被输出到底部目标。
+ destroy([error]): 销毁流。可选地触发 'error' 事件，并且触发 'close' 事件(触发将 emitClose 设置为 false)。调用这个方法后，writable 就结束了，之后再调用 write() 或 end() 都会导致错误。
+ end([chunk[, encoding]][, callback]): 调用 end() 表示后续没有数据要写入到 Writable。可选的 chunk, encoding 参数可以在关闭流之前再写入一块数据。如果传入了 callback 参数，则这个函数会作为 finish 和 error 的事件处理函数。
+ setDefaultEncoding(encoding): 设置 writable 默认的 encoding。只有当写入的数据是 string 类型时，才有意义
+ uncork(): 调用这个方法可以将通过 cork() 方法缓冲起来的数据强制输出到底层目标。一个流上多次调用 cork(), 则必须调用同样次数的 uncork(), 这样才能输出缓冲的数据
+ write(chunk[, encoding][, callback])：将数据写入到流(注意只是到流的 buffer 中，并不能保证已经到底层目标)，并在数据被完全处理之后调用 callback。如果发生错误，callback 有可能没有被调用。为了可靠地检测错误，可以添加 'error' 事件。这个方法会返回 boolean 类型值，表示是否已经达到 highwaterMark, 如果返回 false，则应该停止继续调用 write，而应该在 drain 事件被触发后再继续写入数据。

```js
stream.cork();
stream.write('一些 ');
stream.write('数据 ');
process.nextTick(() => stream.uncork()); // 建议在 process.nextTick 中调用 uncork, 这样可以对单个事件循环中所有 write() 进行批处理。
```

```js
function write(data, cb) {
  // 判断是否应该继续写入数据
  if (!stream.write(data)) {
    // 如果返回false，就不继续写，而是监听 drain 事件，触发时执行 cb, 继续写入数据
    stream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}

write('hello', () => {
  console.log('完成写入，可以进行更多的写入');
})
```


## 实现 Stream

注意实现 stream，不可以调用消费 Stream 的那些公共方法，比如 read()、write()、end()、cork(), 或者通过 .emit() 触发 'error', 'data', 'finish' 等事件

### Readable

readable 的工作流程：

底层数据源 -> readable -> _read -> push -> buffer -> consumer

要实现一个 readable 重点就是实现 _read 方法，通常在 _read 方法中对读取到的数据进行处理，然后调用 push 将处理后的数据添加到 buffer；consumer 通过 read 方法读取 buffer 中的数据 (也可以通过监听 data 事件)

#### 实现方式

实现方式有三种：

+ class 方式：创建一个 class 继承 Readable, 实现 _read 方法
+ ES5 方式：构造函数 + util.inherits，在 prototype 上实现 _read 方法
+ 简化的构造函数方式：直接 new Readable() 构造函数参数提供 { read: function() {...} }，这边的 read 方法其实就是 _read 方法的实现

自定义 Readable 的核心就是实现 _read 方法, 这个方法的核心是:
+ 从其他数据源读取数据
+ 调用 readable.push() 将数据加到内部数据队列