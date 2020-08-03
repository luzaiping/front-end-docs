# 介绍 package.json 常见字段的作用

这边主要介绍要发布一个 npm package 到 npm registery 上，主要会涉及的 field

## name 和 version

这2个是 required field，缺任何一个都会导致 push package 失败。

version 的值要遵循对应的规则； name 可以是不带 scope，也可以带 scope；建议是带 scope 这样可以避开 name 冲突的问题； 比如 @lemhion1908/tiny ，这边 @lemhion1908 就是 scope。 注意这个 scope name 要跟注册的 npm username 保持一致，否则无法 push 成功。

## files

files 是一个数组，定义哪些文件或者文件夹要随着 package 一起发布出去 (其他人通过 git clone 能 clone 到这部分内容)，下面是 reduc-thunk 的配置：

```json
{
  "files": [
    "lib",
    "es",
    "src",
    "dist",
    "index.d.ts"
  ]
}
```

除了 files 定义的内容会发布出去，还有些默认会跟着发布出去，包括：

+ package.json
+ README
+ CHANGES / CHANGELOG / HISTORY
+ LICENSE / LICENCE
+ NOTICE
+ main field 定义的文件

## main

定义 package 的 入口文件，commonJS require(path) 时会根据这个 field 来 resovle module, 看下 redux-thunk 的配置

```json
{
  "main": "lib/index.js"
}
```

## module

这个还不是标准的 filed，是由 rollup 先提出来，webpack 也支持； 这个 field 用于告知支持 ES6 module 的入口文件，看下 redux-thunk 的配置

```json
{
  "main": "lib/index.js",
  "module": "es/index.js"
}
```

main filed 指定 commonJS 版本的 entry； module field 指定 ES 版本的 entry。这2个 版本是可以被引用使用；对于 浏览器 环境，如果要使用，就需要生成 UMD 的 package，一般需要采用 webpack 这类打包工具来完成。



