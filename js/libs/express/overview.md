# express 概览
express是一个nodejs的web framework, 许多其他 web framework 将 express 作为底层 library, 提供了以下机制：
1. 为不同url路径中使用不同HTTP动词的请求(也就是路由)编写处理程序
1. 集成 视图 渲染引擎, 以便将 数据 插入到 模板 来生成 response
1. 设置web应用常用的设置，比如用于连接的端口、用于渲染reponse的模板位置
1. 在请求管道的任意位置添加额外的请求处理中间件

express本身是极简, 开发人员可以通过创建复杂的中间件包解决了几乎所有web开发问题。这些库可以实现 cookies, sessions, user login, URL 参数, Post 数据, 安全头 等功能。

实际开发中主要是针对以下几个方面进行展开：
+ router handler
+ middleware
+ serve static file
+ hadling errors
+ using database
+ views engine

## router handler

router handler 是用于处理特定路由的特定http 动词的函数。比如 app.get(), app.post(), app.all() 这些方法。通常会结合 express 的 Router 来统一管理应用的 router

这部分细节可以参考 [Routes and controllers](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes)

## middleware

中间件通常是对 request 和 response 执行一些操作，然后调用栈里的下一个函数, 下一个函数可能是中间件 或者 router handler.

中间件是express的核心, 通常会使用内置的 middlewares 和 第三方 middlewares 来简化 web 开发任务(cookies, sessions, user authentication, access request post and JSON data, logging)

[express团队维护的 middlewares](http://expressjs.com/en/resources/middleware.html)

## serve static file

使用 express.static 中间件来托管静态文件(html, css, images)

```javascript
app.use(express.static('public'));
```

## handling errors

用于处理错误的中间件函数邮4个参数 (err, req, res, next), 可以用来返回任何内容，但是必须在所有 app.use() 和 routes calls 之后才能调用，也就是说他们要作为请求处理过程的最后一个 middleware。

express 内置了错误处理机制，可以用来处理app中没有处理的错误。如果一个错误传递给 next() 但却没有对应的 error handler 处理它，那么 内置的错误处理handler 就会启用，将 stack trace 直接写给 client。

## using database

express应用可以使用 node 支持的所有数据库(express 本身是没有定义用于数据库管理的特定行为/需求)。常见的数据库有 PostgreSQL, MySQL, Redis, SQLite, MongoDB。

用使用这些数据库，就得通过 npm 来安装对应的 database driver.

## rendering data(views)

template engines 或者 view engines, 通常用于创建 html 内容, 常见的 engines 参考 [engines 模板引擎](https://github.com/expressjs/express/wiki#template-engines) 以及 [engines 的比较](https://strongloop.com/strongblog/compare-javascript-templates-jade-mustache-dust/).

express-generator 默认是是有 pug (以前叫 jade)