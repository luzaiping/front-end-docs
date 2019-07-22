创建 命令行 工具
============

需要使用的 package：

+ commander： 解析命令行参数； 也可以用 yargs ，egg-init 用的就是 yargs。
+ chalk: 命令行内容美化，主要是字体之类
+ inquirer： 命令行交互模式，提供 选项 供用户选择，然后根据选择结果，进行下一步操作，即 prompt 功能

## 开发步骤

开发，测试和最终发布一个 command tool 需要涉及以下几个步骤：

* 开发功能代码，提供可执行文件
* package.json 添加 bin field
* 通过 npm i -g localPath 或者 npm link 进行local测试
* 确认没有问题后，通过 npm publish 发布到 npm registry

### 开发功能代码，提供可执行文件

这步跟开发一个 package 类似，就是编写功能代码，不过有个重要区别，command tool 只需支持 nodejs 环境，因此通常只编译 commonjs 版本即可。

功能代码一般放在 lib 文件夹。除了功能代码，还需要一个可执行文件，一般是放在 bin/ 目录下，这个文件的起始内容必须是

```javascript
#!/usr/bin/env node
```

后面再是调用 lib 功能代码。这个也是跟开发 package 的最大区别

### package.json 设置

要发布一个 command tool，一定要设置 bin  field，这个 field 表示执行 command 时要执行哪个入口文件

```json
{
  "name": "init-react-boilerplate",
  "bin": {
    "init-react": "bin/index.js"
  },
  "main": "lib/index.js"
}
```

这边 bin 的value 是一个 object，其中 key 表示 command name， value 表示入口文件；也可以简写成字符串，即不提供 key；如果是这种情况，那么 command name 就会是 package name。不推荐使用字符串的形式，因为一旦 package name 修改了，那么 command name 也就变了。

另外这边也提供了 main field，这个方便有需要的人可以 require 这个 package，直接引用 lib/index.js 进行一些定制操作。

### 本地测试

再开发完功能后，先进行本地测试，没有问题再 publish 到 npm registry。本地测试，有两种方式：

+ npm i -g localPath
+ npm link

建议都在当前 command tool 所在根目录执行上面2条命令。 执行完后会在 $HOME\AppData\Roaming\npm 生成 commandName.cmd 和 commandName 两个可执行命令文件（commandName.cmd 只有window操作系统才有); 另外会在 $HOME\AppData\Roaming\npm\node_modules  生成一份跟 command tool 文件夹一样的内容。 其实这2个都是通过 symlink 的方式进行关联到实际目录。因此修改实际内容，这2个地方都会实时修改，方便进行测试。

将 command tool "安装" 全局 scope 后， 其他任何地方都可以通过 terminal 指向 command

```bash
init-react
```

而且可以直接在 init-react 后面跟上 argv

除了全局安装，也可以安装到 local，安装到 local 跟全局是类似，不过有个重要区别，那就是执行 command 不一样， local 安装会将内容安装到 node_models
，用执行命令，加到 package.json 的 scrpts 里会比较方便:

```json
{
  "scripts": {
    "init": "init-react -v"
  }
}
```

这样在 terminal 里执行 npm run init，就相当于执行 init-react -v。 __注意__ 要传 argv 就需要写在 script name 对应的内容里。而不能 npm run inin -v 这样传 argv。

### publish

这个跟发布 package 过程是一样，主要是发布版本不需要像 package 那么复杂，正常只提供 commandjs 版本即可。

