# 路径相关的方法总结

## process.cwd()

返回 nodejs 进程的工作目录，即 node 是在哪个目录启动，返回值就是对应目录。通常要结合 fs.realpathSync 来使用，可以确保 symlinks 也能被 resolve

```javascript
const appDir = fs.realpathSync(process.cwd());
```

这个方法的返回值跟 node 在哪里运行是有关系。

## path.resolve([...paths])

根据一个字符串数组，构建一个绝对路径。从最右边的 path 开始依次追加路径，一旦某个 path 是绝对路径，那就构建结束；如果到第一个 path 还没有绝对路径，那就会以当前工作路径作为绝对路径。

最终路径会被 normalized (标准化), 并且会去除最后面的 / 

多个 path，一般最前面这个设置为绝对路径，其他 path 采用相对路径。webpack 打包时会有好几个路径，建议将绝对路径设置为 package.json 所在目录，其他路径基于这个路径构建。

```javascript
path.resolve('/foo/bar', './baz'); // return /foo/bar/baz
path.resolve('/foo/bar', '/tmp/file/'); // return /tmp/file 右边第一个就是绝对路径，那就直接返回，去掉最后面的 /..
path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// 假设当前目录工作目录是 /home/myself/node, 最终 return /home/myself/node/wwwroot/static_files/gif/image.gif
```

当前工作目录是指 node process 运行的目录，相当于是 process.cwd()

## path.join([...paths])

使用 platform-specific separator 将一组 path 拼接起来，拼接起来的可能是绝对路径，也可能是相对路径。path 元素可以不包含 /, 也可以是空字符串，空字符串会被当成 '.', 也就是当前路径

如果是非 string 元素，就会报错。

这个方法跟 resolve 的最大区别是 resolve 返回的是绝对路径，join 返回的可以是绝对路径也可以是相对路径

```javascript
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'); // return /foo/bar/baz/asdf
path.join('foo', {}, 'bar'); // throws TypeError: path 
```

## __dirname 和  __filename

__dirname 返回模块文件所在的目录，也就是这个文件实际存放的文件夹路径，这个路径跟文件在哪里被调用或执行无关。

__filename 返回模块文件的完整路径名称，比 __dirname 多了 文件名称和后缀。

__dirname 相当于是 path.dirname(__filename)

## require(relativePath)

如果是 require 一个 relativePath， 那么这个 relativePath 一定是相对于当前 module。跟这个 module 怎么被执行，在哪里被调用都无关系。

