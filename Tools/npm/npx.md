npx
=======================

## without npm-script

```sh
npx jest
```

可以直接执行本地已经安装的 binary，不需要将这个定义在 npm scripts 中

## executing one-off commands

```sh
npx create-react-app my-cool-new-app
```

可以一次性执行命令，不需要先安装下来。 比如 create-react-app 这种命令行工具，安装完之后可能很久才会用一次，但是却需要先安装到 global 中，有点浪费；使用 npx 可以直接运行 command，而无需安装到 global 中，同时每次运行都能使用最新的 command；当然 npx 需要先将 command 先安装到某个临时文件夹，因此从速度上来讲，这种方式会慢一点。

这种使用方式特别适用于 generator 这类 command，比如 create-react-app 、 vue-cli 等

