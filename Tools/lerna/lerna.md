lerna
=============

这个文档讲解 lerna 介绍和基本使用。

## lerna 是什么

A tool for managing JavaScript projects with multiple packages.

Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

## 项目搭建

### 初始化

```sh
mkdir lerna-repo && cd $_
npm lerna init
```

运行完上面命令后，会在 lerna 目录下创建如下内容：

+ packages/ : 文件夹用于存放 packages
+ package.json : lerna 根项目的 package.json：
   + "private": true 表示私有，不会被发布，是管理整个项目，与要发布的 packages 解耦
   + devDependencies：包含了 lerna
+ lerna.json: lerna 配置文件
   + packages 选项，用于指定 packages 存放目录
   + version 用于指定 packages version

__注意__ lerna 有两种模式，一种是默认的 Fixed, 这种模式所有 packages 维护同一个 version。还有一种 independent 模式，各 packages 可以独立维护自己的 version。使用 lerna init 如果加上 `--independent` 选项，就会使用 independent 模式。

### 增加 packages

使用 `lerna create` 命令可以增加 packages：

```sh
lerna create @lemhion1908/cli
lerna create @lemhion1908/cli-shared-utils
```

这边创建两个 packages (包含 scope), 创建时会提示输入 package.json 信息，创建成功后，package 会放到 lerna.json 里 packages 选项所指定的目录下。

### 添加依赖模块

使用 `lerna add` 可以给指定 package 添加 denpedencies

```sh
lerna add module-1 packages/prefix-*  # module-1 这个packages 添加到 packages 目录下所有以 prefix- 开头的 package 里
lerna add module-1 --scope=module-2 # install module-1 to module-2
lerna add module-1 --scope=module-2 --dev # 同上面类似，区别是安装到 devDependencies, --peer 安装到 peerDependencies
lerna add module-1 # Install module-1 in all modules except module-1
lerna add babel-core # Install babel-core in all modules
```

### 发布

使用 `lerna publish` 可以将 packages 发布到 git 和 npm 仓库

```sh
lerna publish #
lerna publish --force # 强制发布
```

__注意__
+ 如果要同时发布到 git 和 npm 仓库，确保 git 只提交到 staged 即可，后续不要使用 git push，而是要用 lerna publish，这样 lerna 才能识别到版本有版本，才会 publish 到 npm 仓库
+ 有时候有新的修改，但 lerna publish 识别不到版本变化，可以加上 --force 强制发布

到这边一个 packages 项目就搭建和发布完成了。

## 其他命令

### lerna bootstrap

其他人 clone 项目下来后，可以通过该命令安装各自的 dependencies，以及 links any cross-dependencies. 这个命令会执行以下操作：
+ 给每个 package npm install 所有外部 dependencies
+ Symlink together all Lerna packages that are dependencies of each other (将项目有互相依赖的 package，通过 symlink 关联起来)
+ npm run prepublish in all bootstrapped packages (unless --ignore-prepublish is passed).
+ npm run prepare in all bootstrapped packages.

实际安装中，可以根据需要添加参数：
+ --hoist [glob]: 这个参数会将匹配 glob 的所有外部 dependencies 安装到根目录下，这样相同的 dependencies 在每个 package 里都安装一遍。另外如果这些 dependencies 有包含 binaries，那么会被 linked 到独立的 package **node_modules/.bin/** 目录下，这样可以确保各个 package 里的 npm scripts 正常使用。

### lerna clean

将所有 packages 里的 node_modules 删除掉。

### lerna import <path-to-external-repository>

将其他目录下的项目导入到该 lerna 项目里。这个命令要求当前 lerna 项目之前要有一条 git 提交记录才可以成功导入。