zlib
====================

## 九个类

这个 module 是用于压缩和解压缩资源。 它包含了三种压缩/解压缩算法的实现，分别对应以下 9 个类：

+ zlib.BrotliCompress / zlib.BrotliDecompress: 使用 Brotli 算法压缩和解压缩的类
+ zlib.Deflate, zlib.DeflateRaw / zlib.Inflate, zlib.InflateRaw：使用 deflate 算法压缩/解压缩
+ zlib.Gzip / zlib.Gunzip：使用 gzip 算法压缩/解压缩
+ zlib.Unzip：通过自动检测 header 信息解压缩 gzip 或者 deflate 压缩过的流。相等于是 zlib.Gunzip 或 zlib.Inflate 的组合

Deflate 和 Inflate 有对应的 *Raw 类，这个跟没有 Raw 类的区别是：它们不会附加一个 zlib header。

每个类都有下面公共的属性和方法：

+ zlib.byteWritten: 指定压缩引擎处理之前写入的字节数
+ zlib.close([callback])：close the underlying handle.
+ zlib.flush([kind,] callback): Flush pending data。不要轻易调用这个方法，过早地刷新会对压缩算法造成负面影响。执行这个操作只会从 zlib 内部状态刷新数据，不会在 stream 级别上执行任何类型的刷新。它的表现类似于正常的 .write() 调用，
+ zlib.params(level, strategy, callback): 这个只适用于基于 zlib 的流，即不适用于 Brotli。用于动态更新压缩等级和压缩策略，只对解压算法有效。
+ zlib.reset(): 重置 compressor/decompressor 为默认值。仅适用于 inflate 和 deflate 算法。
+ 

## options

每一个类都有一个 options 对象。所有的选项都不是必需的。有一些选项只跟压缩有关，应用到解压缩时会被忽略：

+ flush：**<integer>** 默认值是 zlib.constants.Z_NO_FLUSH
+ finishFlush：**<integer>** 默认值是 zlib.constants.Z_FINISH
+ chunkSize: **<integer>** 默认值是 `16 * 1024`
+ windowBits
+ level: **<integer>** 压缩才有的选项
+ memLevel：**<integer>** 压缩才有的选项
+ strategy：**<integer>** 压缩才有的选项
+ dictionary：**<Buffer> | <TypedArray> | <DataView> | <ArrayBuffer>** (只能是 deflate/inflate，默认是空目录）
+ info: **<boolean>** 如果为 true，则返回一个包含 buffer 和 engine 的对象
+ maxoutputLength：**<integer>** 当使用便利的方法时，这个选项用于限制 output size。默认是 *buffer.kMaxLength*

对于 Brotli-based 的类，可以接收属于 Brotli 的 options 对象。具体就不展开了。

options 对象是在创建上面定义的 9 个类时会被用到，另外通过**便利方法**对数据进行压缩或者解压缩时也可以传递 options 对象。

## 创建压缩/解压缩的类

9个压缩/解压缩的类，都有一个对应的 create 方法，总共有 9 个 create 方法。每个方法都可以接收一个 options 参数，这个参数是可选：

+ zlib.createBrotliCompress([options])
+ zlib.createBrotliDecompress([options])
+ zlib.createDeflate([options])
+ zlib.createDeflateRaw([options])
+ zlib.createGunzip([options])
+ zlib.createGzip([options])
+ zlib.createInflate([options])
+ zlib.createInflateRaw([options])
+ zlib.createUnzip([options])

通过上面这 9 个方法，可以分别创建对应的类对象

## 便利方法

每个类都有一个 异步和同步 的方法，用于压缩/解压缩数据，9个类就有 18 个方法。

每个方法都接收一个 buffer 作为第一个参数，这个 buffer 可以是 `Buffer`, `TypedArray`, `DataView`, `ArrayBuffer` 或者 `String` 类型；一个可选的 options 参数；如果是异步版本，还可以接收一个 callback 参数：

+ zlib.brotliCompress(buffer[, options], callback): 异步方法
+ zlib.brotliCompressSync(buffer[, options]): 同步方法

## 总结

zlib module 内容并不多，总结起来就是以下内容：
+ 9个基础类：用于不同算法的压缩或解压缩
+ 9个创建类的方法：每个类对象由对应的一个 create 方法创建
+ 18个便利方法：这些是不需要创建类对象就可以对数据直接压缩或解压缩的方法，每个类对象各有一个同步和一个异步方法
+ options对象：指定压缩或解压缩的参数，在创建类对象或者调用便利方法时使用
+ 常量：一些定义好的常量，这些通常用在 options 对象。