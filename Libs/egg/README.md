# egg 概览

## basic

+ 内置对象 (Application, Context, Request, Response, Controller, Service, Helper, Config, Logger)
+ 配置 (config/config.***.js)
+ 中间件 (app/middleware/***.js)
+ 路由 (app/router.js)
+ controller (app/controller/***.js)
+ service (app/service/***.js)
+ view (app/view)
+ 定时任务 schedule (app/schedule)
+ 启动自定义 (app.js)
+ 扩展 (app/extend/***.js, 通常就是扩展这5个内置对象 Application, Context, Request, Response, Helper)
+ 引入插件 (config/plugin.js)

## core

+ 本地开发 (egg-bin: debugger, test) 
+ Logger (egg-logger)
+ HttpClient (curl)
+ cookie & session
+ cluster
+ view engine
+ 异常处理
+ 安全 (egg-security)
+ 国际化


## advanced

+ Loader
+ 插件开发
+ 核心开发
