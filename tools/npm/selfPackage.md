# 开发 package/library 的说明


## 需要发布哪些内容

分为 UI library 和 core package

### ui library:

	dist: bundled and minified  (commonjs/amd/umd)
	lib: babel 供浏览器 <script></script> 单独引用某个组件


### core package


   never utilized via <script>

	only provided bundled version (ES/UMD)

	不用提供 lib 文件夹


## 常见 library 分析

### redux-thunk

	src：  es6+
	es：   cross-env BABEL_ENV=es       babel src --out-dir es
	lib：  cross-env BABEL_ENV=commonjs babel src --out-dir lib
	dist： cross-env BABEL_ENV=commonjs NODE_ENV=development webpack
				 cross-env BABEL_ENV=commonjs NODE_ENV=production webpack

### redux


### react

## 