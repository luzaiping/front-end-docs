# React服务端渲染介绍

## 服务端渲染简介

### 什么服务端渲染

### 服务端渲染和客户端渲染的区别

## React服务端渲染的实现原理

### renderToString

### 注意事项

  renderToString 只是将组件内容转换成 html markup, js内容并没有一起返回给浏览器，浏览器在渲染完页面，会加载对应的 app bundle 文件，在下载完之前这段空闲时间里，所有JS事件都是无法触发。

## 结合 React-Router

### map  和 RouterContext

### 解决服务端无法获取 hash 的问题

## 结合 React-Intl

### store 里预置 i18n reducer。（目前实现方式，值得讨论起来）

### FormatMessage 和 defineMessage 的使用

## webpack 相关

### 应用打包

  拆分成 ssr 和 app，两个应用，分别打包成 node 和 web 版本，ssr 根据 开发 和 生成环境，是否打包 require 到 bundle 里

### ssr dev 模式需动态引用 依赖的 bundle 文件

  根据 bundle 依赖顺序动态修改 template.html

  使用 html-webpack-plugin