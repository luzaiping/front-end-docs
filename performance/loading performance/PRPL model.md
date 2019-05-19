# PRPL
## PRPL pattern
是用来构建和服务PWA的一种模式，对APP的delivery 和 launch 有着重要的作用，它代表下面的意思：
+ Push
+ Render initial route.
+ Pre-cache remaining routes.
+ Lazy-load and create remaining routes on demand.
除了达到PWA的基准目标和标准之外，还能优化：
+ 减少 TTI
  * 特别是首次使用
  * 特别是实际应用的mobile设备
+ 最大化缓存效果，
+ 简化开发和部署