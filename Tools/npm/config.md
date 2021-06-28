npm config
=============================

npm 可以从 command line, environment variables 和 npmrc files 这3个地方获取 config settings. 优先级顺序依次降低，即如果有重复的 config parameter，那么 command line 的优先级是最高，npmrc files 是最低

## Command Line Flags

这种方式是通过 `--flag value` 的方式设置，其中 flag 是参数名称， value是参数值，比如

```
--flag1 bar --flag2
```

上面这个设置了两个 npm config parameter，第一个是 flag1，值是 bar；第二个是 flag2，值是 true (没有指定 value，默认就是 true)

还有一种情形是只有 `--`

```
--flag1 --flag2 -- bar
```

上面设置了2个 parameter，值都是 true，最后一个 `--` 是告知 cli parser to stop reading flags，所以 bar 会作为 command argument，而不是 config parameter。

## Environment Variables

然后以 `npm_config_` 开头的环境变量都会被当成是 configuration parameter. 比如在环境变量中设置了 `npm_config_foo=bar`，这个等同于 --foo bar, 配置参数值是大小写不敏感，因此 `NPM_CONFIG_FOO=bar` 是一样的效果。不过 npm scripts 里，npm 会设置自己的环境变量，相比于大写形式，node 会优先使用小写格式。


## npmrc files

npm config 命令可以用来更新和编辑 user 和 global 的 npmrc files, files 总共会有4种：

1. 每个 project 一个配置文件, 放在 project 根目录下，名称是 `.npmrc` (/path/to/my/project/.npmrc)
1. 每个 用户 一个配置文件, 对应 `~/.npmrc` (如果是使用 npmrc 这个lib管理多个 npmrc, 那是存放在 `~/.npmrcs/` 目录下，里面包含多个名称的文件，比如 default 、 lucky)
1. 全局配置文件 (`$PREFIX/etc/npmrc`)
1. npm 内置的配置文件 (/path/to/npm/npmrc) -> `C:\Program Files\nodejs\node_modules\npm\.npmrc`

这4个文件的优先级从高到低依次排下来。文件内容格式都是 `key=value` 的形式。

### per-project config file

存放到每个项目底下，这个文件对于下面两种情形是无效：

+ 当 publish module 时，这种情形不太明白。官方原话是：It has no effect when your module is published. For example, you can't publish a module that forces itself to install globally, or in a different location.
+ 使用 global mode，这个文件也不会被使用，比如 npm install -g

### per-user config file

存放在 `$HOME/.npmrc`； 也可以通过 command line 的 --userconfig 或者环境变量 NPM_CONFIG_USERCONFIG 进行设置

### Global config file

`$PREFIX/etc/npmrc` (`C:\\Users\\Think\\AppData\\Roaming\\npm\\etc\\npmrc`)，也可以通过命令行的 --globalconfig 或者环境变量 NPM_CONFIG_GLOBALCONFIG 进行设置

### Build-in config file

`path/to/npm/itself/npmrc` (`C:\Program Files\nodejs\node_modules\npm\.npmrc`)。这个文件中的配置项是无法修改。


可以通过 `npm config list --json` 查看完整的配置信息

## Default Config

可以通过 `npm config ls -l` 查看 npm 内置 configuration parameters，以及还没设置过值的默认配置


## npmrc lib

当有多个 registry 的时候，比较常见的情形就是公司的 registry (verdaccio) 和 npm registry 同时都要使用； 每个 registry 有各自的 username / email / registry / auth，切换 registry 需要重新设置这些信息就会显得麻烦。 

如果只需要修改 registry url，可以采用 per-project 的方式进行覆盖。 如果需要其他信息，那最好的办法就是给每个 registry 单独配置一份 profile 信息，这个可以通过 npmrc 这个工具来实现：

```sh
npm install npmrc -g // 全局安装
```

后面通过 npmrc 来管理 .npmrc 即可。具体可以参考[官方文档](https://github.com/deoxxa/npmrc) 

__注意__ 使用 npmrc 需要将 `$HOME/.npmrc` 删除掉，因此 npmrc 会创建一个 `.npmrcs` 文件夹, 里面包含了已经配置的 registry 信息