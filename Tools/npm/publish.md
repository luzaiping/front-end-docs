# npm pubuish

## 如何 publish 一个pakcage 到 npm registery

步骤：

1. 先到 npm 官网注册一个账号, 注册好了之后需要通过邮箱激活
1. 注册好了之后，通过 npm login 登陆，按要求填写 username/password/email. 
1. 开发好一个 package 后, 在 package.json 所在的目录运行 npm publish --accesss=public

publish 时碰到的问题及解决办法说明

1. npm login 时，按要求填写信息后，提示账号已经被使用。 是因为混淆了注册时填写的 username 和 fullname
1. npm publish 时，提示 402 。 这是因为 package name 是 @lzp/tiny, 带有 scope，默认是发送到 private 仓库。 解决办法： 加上 --access=public， 这样就会发布到公共仓库。
1. npm publis --access=public, 提示 403 forbidden。 原因是 package name 的 scope 写成 @lzp, 而 username 是 lemhion1908, scope 必须是 username，其他 username 就不是一样 scope，自然就没有权限。package name 改成 @lemhion1908/tiny 就可以了。