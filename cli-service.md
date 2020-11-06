lucky-cli-service 走读
=======================

## Service.js

1. init
2. loadUserOptions (读取 lucky.config.js 和 package.json 中的配置信息)，并返回。
   1. 读取 package.json 中的 defaultAppName 和 polyfills，这2个的优先级要高于 lucky.config.js。
   2. ensureSlash lucky.config.js 中的 publicPath (将 单 / 换成 双 /)
   3. removeSlash lucky.config.js 中的 outputDir
   4. validate resolved (resolved 要嘛是 lucky.config.js 要嘛是 package.json 要嘛是 inlineOptions ), 就是校验配置的 options 是否合法
3. loadsh.defaultsDeep(userOptions, defaults()) 将默认信息跟获取到的 options 进行合并
4. this.appConfigs = resolveApps(this.pkgContext, this.projectOptions) -- lib/util/resolveApps.js
  1. getAppNames: 获取指定 app 类型下的应用名称 (目前支持 spa 和 h5 类型，对应的路径就是 /spa/apps 和 /h5/apps)，可以是多个，会检测名称重名问题，比如 /spa/apps/ 可以放置多个不同的 spa 应用； /h5/apps 也是类似。通过一步获取到所有需要打包的应用名称。这边要求每个 app 下都必须有一个 index.html 文件，如果没有就不能作为一个 app。最终得到的 appName 是 spa.pmall 这样的格式，即 type + appName
  1. appNames.map(genName): 将 appNames 数组 转换为一个包含 对象的数组。比如 appNames 是 ['spa.pmall', 'spa.test'] -> [{meta: 'spa.pmall', name: 'pmall'}, {meta: 'spa.test', name: 'test'}]
  2. 对 genName 转换后的数组 进行 map(genDir) 处理，在原有对象的基础上增加 dir 属性，改属性值包含完整的 文件路径
  3. 对 genDir 转后的数组 进行 map(genEntryFile) 处理，在原有对象的基础上增加 entryFile 属性，属性值是 entry 文件的完整文件路径，这边按顺序依次获取 `index.js`, `index.jsx`, `index.ts`, `index.tsx`，只要找到其中一个，就不继续查找
  4. genHtmlWebpackPluginConfig
