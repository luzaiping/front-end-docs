path
==========================

这个文档对 path module API进行说明，区别于 API 文档，这个文档侧重于相关联API的讲解

## path.resolve & path.join

在实际应用中，这2个 API 方法通常被用于获取一个文件的路径，不过两个的用法还是有些区别：

+ path.resolve 本质就是用于获取绝对路径，因此更推荐使用这个方法
+ path.join 只是将多个path进行拼接而已，不一定会返回绝对路径。实际应用中通常会结合 `__dirname` 来获取绝对路径
+ path.resolve 是从右向左计算路径，一旦能构造出绝对路径，就立即结束


## path.sep & path.delimiter

path.sep 是用于获取特定平台的文件夹分割符，比如 POSIX 系统用的是 `/`,  windows 系统是 `\`

'foo/bar/baz'   // POSIX
'foo\\bar\\baz' // window

path.delimiter 是用于获取多个路径的分隔符，POSIX 是返回 `:`, windows 是返回 `;`

通常在 process.env.PATH 中可以看到. 

'/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'  // POSIX 系统
'C:\Windows\system32;C:\Windows;C:\Program Files\node\'  // WINDOWS

## path.format & path.parse

这2个的作用是相反：

path.format: 将一个 pathObject 转换为一个 string path
path.parse: 将一个 string path 转换为一个 pathObject

有点类似 JSON.parse 和 JSON.stringify

这边说下 pathObject 各个字段的意义

```js
path.parse('/home/user/dir/file.txt');
```

上面这个代码会返回：

// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }

┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
"  /    home/user/dir / file  .txt "
└──────┴──────────────┴──────┴─────┘

使用 path.format, pathObj 可以包含 dir, root, base, name, ext:

+ 如果指定了 dir，那么 root 会被忽略；
+ 如果指定了 base，那么 name 和 ext 会被忽略。

## path.basename vs path.dirname vs path.extname

path.basename(path, [ext]): 用于返回一个路径的最后一部分，ext 是可选，如果使用的话，可以获取不包含后缀的文件名称

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```

path.dirname(path)：返回一个路径的目录名称, 即去掉 path = path.dirname(path) + path.basename(path)

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```

通常可以用这个获取当前文件的目录

```js
path.dirname(__filename) === __dirname  // 返回 true
```

path.extname(path): 就是返回一个路径的后缀名称；如果最后一个 `.` 后没有内容就返回 '.'; 最后一个 `.` 前面没有内容，就返回 '', 看下例子
```js
path.extname('index.coffee.md'); // Returns: '.md'
path.extname('index.'); // Returns: '.'， 最后一个 . 后面没有其他内容了，就只能返回 .
path.extname('.index'); // return ''  最后一个 '.'
path.extname('index');  // return '', 没有 . 也是返回 ''
```

## path.win32 vs path.posix

这2个是 path 在 windows 和 posix 系统的对应实列，如果需要获取特定平台的信息，可以直接使用这2个实列。

```js
path.win32.basename('C:\\temp\\myfile.html'); // Returns: 'myfile.html'
path.posix.basename('/tmp/myfile.html'); // // Returns: 'myfile.html'
```

