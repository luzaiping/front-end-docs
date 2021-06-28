如何管理自有的 package
===========================================

这个文档主要讲述 npm package 相关内容，包括 package 和 module 区别、 package scope、 version、 publish/unpublish、 deprecate/undeprecate，即如何创建一个 package，并发布到 npm，以及如何废弃 和 取消发布。

## package vs module

package: 必须包含一个 package.json，用于将内容发布到 npm registry
module: module 是 node_modules 目录下任何可以通过 nodejs require() 引入的 文件或者文件夹； module 可以是下面两种之一：
1. 一个文件夹 ，里面有 package.json 文件，package.json 中必须有 'main' field
1. 一个 js 文件

根据上面的情形可以看出，不是所有 module 都是 package，像上面的例子只有第一种是 package，第二种只是 module。 

## scope / access level / visibility

### scope

package 可以带有 scope，格式是 `@scopeName/package-name`, 如果没有指定 scope，默认就只有 package-name。 带有 scope 的 package，相当于是有 namespace，不同 scope 即使 package-name 相同也没问题。

package visibility 可以分为 public 和 private: 只有 scope package 才有机会成为 private，如果是个人帐号，要发布 private package 需要升级帐号，一般没有必要；如果是公司帐号，可以直接发布 private package

access level 跟 scope 有关，具体可以查看[官方文档](https://docs.npmjs.com/package-scope-access-level-and-visibility)

## publish

这边以发布一个 public scoped package 为例，整体步骤如下：

1. 先到 npm 官网注册一个账号, 注册好了之后需要通过邮箱激活
1. 通过 npm login 登陆，按要求填写 username/password/email.
1. 之后就是按照规范开发一个 package，package name 和 version 要写好 (通常这边需要将源码发布到 github, 再通过 git remote add url 进行关联)
1. 开发好一个 package 后, 在 package.json 所在的目录运行 npm publish --accesss=public

publish 时碰到的问题及解决办法说明

1. npm login 时，按要求填写信息后，提示账号已经被使用。 是因为混淆了注册时填写的 username 和 fullname
1. npm publish 时，提示 402 。 这是因为 package name 是 @lzp/tiny, 带有 scope，默认是发送到 private 仓库。 解决办法： 加上 --access=public， 这样就会发布到公共仓库。
1. npm publish --access=public, 提示 403 forbidden。 原因是 package name 的 scope 写成 @lzp, 而 username 是 lemhion1908, scope 必须是 username，其他 username 就不是一样 scope，自然就没有权限。 package name 改成 @lemhion1908/tiny 就可以了。

__注意__ npm registry 是用于发布和存储最终开发完的 package，github 是用于存储源码，通常在 github 上创建项目，然后 clone 到本地，开发完之后提交到 github，同时 publish 到 npm registry。

## npm version

当对 package 做了修改之后，可以手动修改版本号，也可以通过命令行修改

```sh
npm version <update_type>
```

update_type 可以是 patch / minor / major 这三个中的一个

修改完代码和 package.json 之后，再运行 npm publish 将 package 推送到 npm registry

## npm deprecate / undeprecate

如果不再维护 package 或者 package 的某个版本，可以通过 `npm deprecate` 处理：

```sh
npm deprecate <package-name> "message"
```

上面这个命令是 deprecate 整个 package, 这样下次用户使用这个 package，就能看到 depreacte message


```sh
npm depreacte <package-name>@<version> "message"
```

上面这个命令是 deprecate package 的某个版本，通常是希望用户升级版本

如果要撤回 deprecate 可以通过 undeprecate, 只需将上面命令的 "message" 换成 "" (空字符串), 就能实现 undeprecate

__注意__ 如果是使用 two-factor auth，需要在命令后面加上 `--otp=123456`

## 将 package 转交给 npm 负责

比如不再维护某个 package 了，就可以将这个 package 转交给 npm 这个用户

```sh
npm owner add npm <package-name>
npm owner rm <user> <package-name>
```

依次执行上面两条命令，替换掉对应的 package-name 和 user 即可。

## unpublish

发布完某个版本后，如果需要取消对于的发布，可以通过 unpublish 处理：

```sh
npm unpublish <package-name>@<version>
```

如果要取消整个 package 的发布，即完成从 registry 中移除

```sh
npm unpublish <package-name> -f
```

如果是发布后的 72 小时内，是可以直接 unpublish; 超过 72 小时就必须遵循某些条件才可以。