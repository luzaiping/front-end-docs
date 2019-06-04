# Requiring Modules

node 使用2个 core modules 用来管理 module dependencies:

+ require module
+ module module

这2个是 global scope, 可以直接使用，不需要单独 require。

require('/path/to/file'), require 函数接收一个唯一参数，如果这个参数是 本地文件路径，那么 node 会按下面步骤执行：

+ Resolving: 确定请求文件的绝对路径
+ Loading: 决定请求文件的类型
+ Wrapping: 给定文件属于它的私有作用域. 这会将 require 和 module 这2个对象变为请求文件的本地变量
+ Evaluating: 这是 VM 最终执行加载代码
+ Caching: 将文件内容进行缓存，这样下次请求就不需要再重复上面的步骤了。

## Resolving a local path


