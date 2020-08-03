# All in one

redux的代码内容不多，主要包含下面这个文件
+ createStore: 用于创建store, 需要传 rootReducer, preloadState(可选), middlewares(可选，也是核心)
+ combineReducers: 将多个 split reducer 合并成一个root reducer, root reducer将作为 createStore的必须参数
+ applyMiddleware: 对middleware进行处理
+ compose: 被 applyMiddleware 调用
+ bindActionCreator