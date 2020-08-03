Buffer
================================

Buffer 是 UIint8Array 的子类，即每个元素能存储的值是 0 ~ 255 之间，如果要存储超过这个范围的数值，需要用多个字节存储

## 创建方式

创建 Buffer 有以下几种方式：

### Buffer.from

这个方法可以接收不同的参数，因此有不同的方法变种：

+ Buffer.from(array): 使用字节数组创建一个新 buffer
+ Buffer.from(arrayBuffer, byteOffset, length): 创建一个 buffer，这个buffer和底层的arryBuffer是共享内存
+ Buffer.from(buffer): 创建一个 buffer，新 buffer 只是拷贝 buffer 的值，但是内存是不共享
+ Buffer.from(string, encoding): 创建一个 buffer，内容是由 string 和 encoding 指定 (涉及到 encoding)

Buffer.from 创建的 buffer 都已经包含了 内容，因此无需再单独调用 fill() 方法进行初始化。

### Buffer.alloc

+ Buffer.alloc(size[, fill[, encoding]]): 返回一个指定大小并且初始化的 buffer。默认 fill 是 0
+ Buffer.allocUnsafe(size): 创建一个包含指定大小的 buffer。这个是未初始化的 buffer，速度相比 alloc 要更快，但是可能会包含敏感数据
+ Buffer.allocUnsafeSlow(size): 同 Buffer.allocUnsafe 类似，但是这个方法不会用到 `shared internal memory pool`

处于安全考虑，调用这个方法后应该再调用 .fill 进行初始化。

### buf.slice & buf.subarray

这2个方法类似 Array 的方法，接收一样的方法参数 start, end; 

+ slice 会返回一个共享内存的 buffer
+ subarray 也是返回一个共享内存的 buffer

### internal memory pool

nodejs 内部维护了一个 memory pool，方便快速分配内存。这个内存空间的大小由 Buffer.poolSize 指定。如果要创建的 buffer 空间小于等于 Buffer.poolSize，那么就会使用这个 memory pool。目前有2个方法会用到这个机制：

+ Buffer.alloc
+ Buffer.from(array)
