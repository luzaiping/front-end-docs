egg plugin
=================

### service

1. set：
1. get：获取白名单列表，controller 利用白名单判断当前登陆用户是否能使用 vconsole

### 发布过程

1. 跳过 husky 验证： npm commit -m 'message' -n; 之后 git push 推送代码
2. 在 具体 package 目录下，先执行 npm login, 登陆成功后，再执行 npm publish
3. publish 成功后到 http://verdaccio.luckincoffee.com 搜索 plugin (按名称查询即可)
4. 引用 plugin，测试 (NODE_LUCKY_ENV=prod npm run dev:server)