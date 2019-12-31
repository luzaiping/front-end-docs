prettier
==================================

安装插件是为了代替 CLI，可以直接通过快捷键修复格式，插件是可选，但是有了会更方便

配置文件是可选，没有的话，会读取 .editorconfig 或者 vscode setting

在项目中使用 prettier, 安装对应 package 是必须, 
   
## prettier 整合 eslint

eslint-config-prettier：禁用 eslint format 跟 prettier 冲突的配置，只使用 prettier 的配置

eslint-plugin-prettier：将 prettier 的校验 作为 eslint rules 一部分，这样就可以在编辑器里实时得到提示信息；也不需要分别执行 lint 和 format，只需执行 lint 就可以

如果引入新的 `eslint-plugin-*`, plugin 增加了新的 format 跟 prettier 有冲突，那要增加对应的 `eslint-config-*` 来禁用该 plugin 所引入的 format rule。

_注意:_ 一定不要在 eslint 的 rules 里对特定的 format rule 进行单独配置

## prettier 和 EditorConfig 一起使用

prettier 也能读取 .editorconfig 配置文件中的配置项，因此这两者共同的配置，要配置在 .editorconfig 里，目前如下配置项是两者的交集:

+ indent_style
+ indent_size
+ end_of_line
+ max_line_length
+ tab_width

这些都是跟 Editor 相关的内容，因此配置在 .editorconfig 是最合适。其他 format 相关的配置项才配置在 .prettier* 文件里。lint 相关内容配置在 .eslintrc* 的 rules.