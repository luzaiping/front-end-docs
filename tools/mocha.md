# mocha 笔记

## 修改mocha的默认脚本目录

mocha默认执行根目录下test文件夹里的文件(子文件夹里的文件不会被执行，比如 test/foo 里的文件是不会被调用)，可以通过 glob 模式，在命令行里制定路径

> mocha \*\*/test/**/*.js'

## mocha 集成 babel

1. 安装 babel-core 以及 所需的 presets，比如 babel-preset-es2015
1. 在package.json里添加script：__"test:mocha": "mocha --compilers js:babel-core/register test/**/*.js"__
1. 也可以用 --recursive递归test的子目录, 如果脚本本身在test目录下，用这个配置更方便，就无需用glob指定目录
1. __"test:mocha": "mocha --compilers js:babel-register --require babel-polyfill --require ignore-styles -r mock-local-storage --recursive"__

注：

+ 上面这个配置是babel官方的例子。具体参考 [mocha集成babel](http://babeljs.io/docs/setup/#installation 'mocha集成babel')
+ ignore-styles: A babel/register style hook to ignore style imports when running in Node. [npm地址](https://www.npmjs.com/package/ignore-styles)
+ mock-local-storage 模拟localStorage，无需browser [npm地址](https://www.npmjs.com/package/mock-local-storage)