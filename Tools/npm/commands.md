commands
====================

这边只记录一些比较实用和需要注意的 command，完整内容要参考[官方文档](https://docs.npmjs.com/cli/v6/commands)

## adduser

用于新增 或者 登陆指定帐号, 跟 login 是一样

## audit

可以用来查看 project 所安装的 modules 是否有安全漏洞

```sh
npm audit // 生成报告
npm audit fix // 自动修复可以直接处理的package，还可以有其他参数做进一步自定义
```

## config

### 全局安装路径

```sh
npm config get prefix -g
```

可以通过上面的命令查看全局安装目录

nodejs 安装方式: 全局 npm 安装路径是： C:\Users\<username>\AppData\Roaming\npm
nvm 安装方式:    全局 npm 安装路径是： C:\Users\<username>\AppData\Roaming\nvm\v14.15.3

nvm 安装方式，会给每个版本一个单独的文件夹，因此需要为每个 版本 单独安装一次 global package

## ls / list

查看第一级 installed packages

```sh
npm list --depth=0
npm list --depth=0 -g  // 查看全局
```

## update

```sh
npm update name-of-package  // 更新特定的 lib
npm update // 更新所有
```

npm update 会将版本更新到最合适的版本，而不是最新的版本 (除非刚好这2个版本是一样)。 因为每个 package 都会有对应的依赖，npm 会判断到底哪个版本才是最合适的版本。 另外不同版本表示法，更新策略也是不同：

+ `^` 开头，比如 `webpack: ^3.3.0`, 更新的时候最多只会更新到 minor 和 patch，而不会修改 major
+ `~` 开头，比如 `webpack: ~3.3.0`, 更新的时候最多只会更新 patch, 不会修改 major 和 minor
+ `*`,      比如 `webpack: *`, 更新的时候 major, minor, patch 都有可能被修改