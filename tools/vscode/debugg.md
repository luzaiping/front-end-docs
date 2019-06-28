# debug

## 当前文件

```javascript
{
  "type": "node",
  "request": "launch",
  "name": "current file",
  "program": "${file}"
}
```

打开任意 .js 文件，左上角 debug 选择 current file， 然后F5就会进入debug.


## 远程调试

```javascript
{
    "type": "node",
    "request": "attach",
    // "protocol": "inspector",
    "name": "ssr",
    "address": "localhost",
    "port": 8080,
    "sourceMaps": true
    // "localRoot": "${workspaceFolder}\\src\\main\\js",
    // "remoteRoot": "${workspaceFolder}\\src\\main\\js\\dist"
  }
```

属性说明：

+ __address__ 和 __port__ 指定远程服务的地址和端口
+ __sourceMaps__ 指定调试的代码需要使用 sourceMaps，即实际运行的代码是经过源码转换过的(transpiler)，通常是经过babel 或者 webpack 处理过的。如果是 webpack 则需要指定 devtool: 'source-map'(不可以是cheap-module-eval-source-map。具体参考 https://webpack.js.org/configuration/devtool/)
+ __request__ 要采用 attach 方式，而不是 launch

另外启动运行代码时(直接 node 或者 npm 都可以)，要加上 --inspect=host:port 参数，比如

```sh
node --inspect=localhost:8080 ./bin/server.js
```

## chrome debug

```
{
  "type": "chrome",
  "request": "launch",
  "name": "app",
  "url": "http://localhost:8080",
  "webRoot": "${workspaceFolder}\\src\\main\\js\\",
  "sourceMaps": true
}
```

属性说明：

+ __url__: 指定实际请求地址和端口
+ __webRoot__: 指定实际源代码(不是transpiled后的代码)的存放位置
+ __sourceMaps__: 跟上面一样，表示实际运行的代码是经过转换后的，所以要对源码先进行转换处理