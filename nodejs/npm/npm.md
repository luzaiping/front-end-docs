npm
========================

## npm registry

### 项目级别

可以在项目中添加 `.npmrc` 文件，用于指定该项目的 npm registry

```
registry=http://verdaccio.10101111.com
```

### 全局

```sh
npm get registry     // 查看当前使用的 registry
npm set registry=http://registry.npmjs.org/   // 设置新的 registry
```
