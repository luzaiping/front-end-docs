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

## dependency

### 查看顶层 lib

```sh
npm list --depth=0
npm list --depth=0 -g  // 查看全局
```

### 更新

```sh
npm update name-of-package  // 更新特定的 lib
npm update // 更新所有
```

npm update 会将版本更新到最合适的版本，而不是最新的版本 (除非刚好这2个版本是一样)。 因为每个 package 都会有对应的依赖，npm 会判断到底哪个版本才是最合适的版本。 另外不同版本表示法，更新策略也是不同：

+ `^` 开头，比如 `webpack: ^3.3.0`, 更新的时候最多只会更新到 minor 和 patch，而不会修改 major
+ `~` 开头，比如 `webpack: ~3.3.0`, 更新的时候最多只会更新 patch, 不会修改 major 和 minor
+ `*`,      比如 `webpack: *`, 更新的时候 major, minor, patch 都有可能被修改