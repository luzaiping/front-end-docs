os
====================

这个文档记录 os module。这个 module 提供了与操作系统相关的实用方法或者属性，使用时需要通过 require 先引入模块

```js
const os = require('os');
```

## os.EOL

操作系统特定的 end-of-line marker：

+ posix : 返回的是 \n
+ windows: 返回的是 \r\n

__注意__: 通过 console.log 打印 os.EOL 是看不到具体内容，只能看到换行效果。

## os.arch()

返回编译 Nodejs 二进制文件的操作系统的 CPU 架构。可能的只有：'arm'、 'arm64'、 'ia32'、 'mips'、 'mipsel'、 'ppc'、 'ppc64'、 's390'、 's390x'、 'x32' 和 'x64'。

这个方法的返回值等同于 `process.arch`。

## os.cpus()

返回一个对象数组，其中每个对象包含每个逻辑 CPU 内核的信息：

+ model: `<string>`
+ speed：`<number>` 为 兆赫兹 (MHz) 为单位
+ times: `<object>`
   - user `<number>` CPU 在 user mode (用户模式) 下花费的毫秒数
   - nice `<number>` CPU 在 nice mode (良好模式) 下花费的毫秒数。这个仅在 POSIX 系统有效，在 windows 系统上，值都为 0
   - sys `<number>` CPU 在 sys mode (系统模式) 下花费的毫秒数
   - idle `<number>` CPU 在 idle mode (空闲模式) 下花费的毫秒数
   - irq `<number>` CPU 在 irq mode (中断请求模式) 下花费的毫秒数

## os.endianness()

返回一个字符串，用于标识编译 nodejs 二进制文件的 CPU 的字节序：
+ 'BE': 大端字节序
+ 'LE': 小端字节序

## os.freemem()

返回整数格式的系统空闲内存大小，以 byte 为单位

## os.getPriority([pid])

返回指定 pid 进程的调度优先级。如果 pid 为空或者为 0，就返回当前进程的优先级

## os.homedir()

返回当前用户字符串形式的主目录路径。

在 POSIX 上，使用 $HOME 环境变量 (如果有定义)。否则，使用有效的UID 来查找用户的主目录
在 WINDOWS 上，使用 USERPROFILE 环境变量 (如果有定义)。否则，使用当前用户的配置文件目录的路径。

## os.hostname()

以字符串形式返回计算机的主机名。

## os.loadavg()

返回一个数组，包含 1、5 和 15 分钟的平均负载。

平均负载是系统活动性的测量，由操作系统计算得出，并表现为一个分数。

平均负载是 UNIX 特定的概念。在 windows 上，其返回值始终为 [0, 0, 0]

## os.networkInterfaces()

返回一个对象，该对象包含已分配了网络地址的网络接口。

对象上的每个 key 都标识了一个网络接口。关联的值是一个对象数组，每个对象描述了一个分配的网络地址。

分配的网络地址对象上可用的属性包括：

+ address `<string>` 分配的 IPv4 或 IPv6 地址。
+ netmask `<string>` IPv4 或 IPv6 的子网掩码
+ family `<string>` IPv4 或 IPv6
+ mac `<string>` 网络接口的 MAC 地址
+ internal `<boolean>` 不可远程访问的回环接口或类似的接口，就返回 true；否则返回 false
+ scopied `<number>` 数值型的 IPv6 作用域 ID (仅当 family 是 IPv6 时才有意义)
+ cidr `<string>` 以 CIDR 表示法分配的带有路由前缀的 IPv4 或 IPv6 地址。如果 netmask 无效，则此属性会被设为 null。

```json
{
  "WLAN": [
    {
      "address": "fe80::9c0d:b363:3157:7676",
      "netmask": "ffff:ffff:ffff:ffff::",
      "family": "IPv6",
      "mac": "d4:6d:6d:fd:0b:74",
      "internal": false,
      "cidr": "fe80::9c0d:b363:3157:7676/64",
      "scopeid": 3
    },
    {
      "address": "10.130.161.83",
      "netmask": "255.255.240.0",
      "family": "IPv4",
      "mac": "d4:6d:6d:fd:0b:74",
      "internal": false,
      "cidr": "10.130.161.83/20"
    }
  ],
  "Loopback Pseudo-Interface 1": [
    {
      "address": "::1",
      "netmask": "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
      "family": "IPv6",
      "mac": "00:00:00:00:00:00",
      "internal": true,
      "cidr": "::1/128",
      "scopeid": 0
    },
    {
      "address": "127.0.0.1",
      "netmask": "255.0.0.0",
      "family": "IPv4",
      "mac": "00:00:00:00:00:00",
      "internal": true,
      "cidr": "127.0.0.1/8"
    }
  ]
}
```

## os.platform()

返回一个 string 用以标识 operating system platform. 这个值在 compile 时被设置。这个值等同于 `process.platform`。可能的返回值包括：
+ linux
+ win32
+ sunos
+ aix
+ darwin
+ freebsd
+ openbsd

## os.release()

返回一个 string 标识操作版本

## os.tmpdir()

返回一个字符串，表示操作系统默认的临时文件目录

## os.totalmem()

返回系统的总内存量，单位是 byte

## os.type()

返回操作系统名称，在 linux 上会返回 *Linux*，在 macos 返回 *Darwin*，在 windows 上返回 *Window_NT*

## os.uptime()

返回系统的正常运行时间，以 s 为单位

## os.userInfo([options])

返回关于当前有效用户信息的对象。返回的对象包含：username、uid、gid、shell、homedir。在 windows 上，uid 和 gid 值为 -1，shell 值为 null。在 POSIX 平台上，返回对象通常是密码文件的子集。

os.userInfo() 返回的 homedir 由操作系统提供。与 os.homedir() 的返回结果不同，os.homedir() 是在返回操作系统的响应之前会先查询主目录的环境变量。

## os.version()

返回一个 string，标识 内核 版本。在 windows 上运行竟然报错，奇葩。

## 常量

+ os.constants.signals: 这是一个对象，包含了跟信号有关的常量
+ os.constants.errno: 一样是对象，包含了错误常量，分为 POSIX 和 WINDOWS 两部分
+ os.constants.dlopen：如果在操作系统上可用，那么会包含这个对象的常量
+ os.constants.priority：进程调度优先级相关的常量，总共有 6 个
+ os.constants.UV_UDP_REUSEADDR: libuv 常量


## 总结

os module 就是提供一些操作系统相关的信息。除了 os.EOL 和 os.constants.* 之外，其他全部是方法。