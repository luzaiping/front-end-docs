# dependency 区别

## dependencies

  放在这个 property 下面的 package，是应用运行时需要依赖的包，通常是指部署到生产环境后所需的最小依赖包

  在有 package.json 的目录里，执行 npm install, 会安装配置在这个key里的所有依赖包

## devDependencies

  只有开发时需要用到的包，通常用于打包、构建、转化代码用，比如 babel、eslint、webpack 这类包。

  在有 package.json 的目录里，执行 npm install, 会安装配置在这个key里的所有依赖包

## peerDependencies

  一般只有开发 library 或者 插件 供其他人使用才会用到这个配置。

  最常见的就是 react-dom，对应的 package.json 里配置了

```json
"peerDependencies": {
  "react": "^16.0.0"
}
```

这个表示要使用 react-dom 的应用，必须安装 react，并且版本要符合 ^16.0.0 这个要求

npm3之后，配置成 peerDependencies，都需要手动安装。

## bundledDependencies

  指定哪些依赖包要跟当前library一起打包发布

## optionalDependencies

  可选的依赖包，这些包安装失败不会影响npm命令的正常运行。

  配置在 optionalDependencies 的 library 会覆盖 dependencies 的包，所以同一个名称的包不要配置在2个地方。