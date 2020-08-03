# offline & storage

## offline
通过 service worker 来实现，参考 [google developer](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/)

## storage
浏览器的storage有根据data model 可以分为以下几种方式：

1. byte stream：包括 File System, cloud storage
1. key/value: 包括 local storage, session storage, Cache
1. structure: 包括 cookies，WebSQL
1. hybrid: 包括 IndededDB

每一种在 浏览器支持，是否事务功能，同步/异步操作 这几方面上都有差异

google devTools 在 Application tab 页面上提供了 local storage/session storage/cookies/web sql/cache/indededdb 的管理