规范化工具集成配置
=====================

这边记录前端规范化所用到的几个工具是如何集成，涉及的工具包括：
+ .editorconfig
+ eslint
+ prettier
+ husky
+ lint-staged
+ commitizen, cz-conventional-changelog
+ @commitlint/cli, @commitlint/config-conventional

## 配置 .editorconfig

由于不同编辑器, 所使用的代码风格会有差异，比如缩进格式，有的编辑器默认是使用 空格，有的是使用 tab；这样就会造成同一份文件，在不同编辑器使用上出现问题。

而 .editorconfig 文件就是用于统一不同编辑器的差异，规范化一致的代码风格。这个工具的功能跟 prettier 有重叠，而且能配置的信息也没有 prettier 丰富。不过由于它的轻便和易用，另外有些项目并未必会采用 prettier；因此实际应用中，建议跟 prettier 有重叠的配置统一由 .editorconfig 配置。下面是一份常见的配置：

```
# 下面这5个配置项跟 prettier 配置是重复，建议定义在这边
[*]
indent_style = space
indent_size = 2
end_of_line = lf # 保证在任何操作系统上都有统一的行尾结束字符
max_line_length = 80
tab_width = 2

charset = utf-8
insert_final_newline = false

# 针对 markdown 文件的配置
[*.md]
trim_trailing_whitespace = false

# 针对js, jsx文件的配置
[*.{js,jsx}]
trim_trailing_whitespace = true
```

## 配置 eslint

eslint 是用于校验 js, ts 语法的校验工具。建议使用 'eslint:recommended','airbnb' 这两个 config。具体配置就不展开

## 集成 prettier

prettier 是对代码风格的校验工具，而 elsint 除了语法校验，也会校验代码风格。这会导致两者在代码风格校验上的冲突。在集成 eslint 和 prettier，通常需要用到下面的 config 和 plugin：

+ eslint-config-prettier：这个 config 可以解决 eslint 和 prettier 在代码风格校验规则上的冲突；这个 config 会对 eslint rule 进行处理，将跟 prettier 有冲突或者不必要的 rule 关掉。
+ eslint-plugin-prettier：这个可以将 prettier 校验规则作为 eslint 的一部分，这样运行 eslint 也会同时校验 prettier 规则

由于这2个特性特别实用，官方提供了 'plugin:prettier/recommended', 通过继承这个 config，就无需配置上面的 config 和 plugin：

```js
module.exports = {
  extends: ['eslint:recommended','airbnb', 'plugin:prettier/recommended', 'prettier/react']
}
```

上面是 eslint 的一小部分配置，定义了要继承哪些 config。'eslint:recommended' 和 'airbnb' 是对语法的校验，'plugin:prettier/recommended' 让代码风格由 prettier 进行校验，同时又集成了 eslint。 'prettier/react' 是 prettier 提供的关于 react 的代码风格规则，如果有用到 react，建议要配置。

__注意__ eslint config 配置有顺序要求，后面的配置会覆盖前面的配置，因此上面这四个的配置顺序不能随意打乱。

## 集成 husky

配置完 .editorconfig, eslint 和 prettier 后，这个项目的代码语法和风格就能统一了。但是如果违反了规则，虽然校验工具会给出警告或者错误，但是并不影响代码提交，即还是可以将不符合规范的代码提交到 git 仓库。为了解决这个问题，需要引入 husky，这个工具可以定义 git hook 任务。要限制提交不符合规范的代码，需要配置 `pre-commit` 这个 git hook, 在 package.json 中添加如下配置：

```json
"husky": {
  "hooks": {
    "pre-commit": "npm run eslint"
  }
}
```

有了上面这个配置后，当提交代码到 git 仓库时，会先执行 npm run eslint，一旦 eslint 校验不通过，就会阻止本次提交。 

```sh
git commit -m 'msg'
```

在 shell 里运行提交代码，就能看到 husky 运行 log。

__注意__ 如果是在 vscode 的 git 面板里提交代码，即非命令行形式，默认是看不到 husky log，如果校验失败，会弹窗显示，可以点弹窗里的链接查看具体错误信息。

## 集成 lint-staged

上面的 husky pre-commit 定义的任务是 `npm run eslint`, 这个任务会在每次提交代码时都会运行一遍。这会导致不必要的校验工作，尤其是之前代码都已经通过 eslint 校验，后面新增或者修改的提交还需要再重新校验一遍，就显得多余。另外项目一旦变大，每次都完整校验一遍，效率上也慢很多。

lint-staged 就是用于解决这个问题，它只会对本次要提交的代码进行校验。

配置 lint-staged 最简单的方法就是实用官方推荐的命令：

```sh
npx mrm lint-staged
```

这个命令会根据当前 package.json 里已安装的校验工具(比如 eslint 和 prettier)，自动安装和配置 husky 和 lint-staged。

__注意__ 要求校验工具事先安装并配置在 package.json 里的 dependencies (经过测试 devDependencies 也是可以)

到这一步就实现了对代码风格和语法规范化的流程。

## commitizen, cz-conventional-changelog

这两个工具是用于规范化 git commit message。在没有规范的情况下，开发人员的 commit message常常是随意的，这就导致 commit message 显得很无用。可是当你在做git log 、code review、编写changelog等情况时，良好的 commit 规范就显的尤为重要。

通过使用这两个工具，可以交互式地选择和填写 commit message, 这样就可以统一整个项目的 commit message。

### 安装 commitizen

```sh
npm i -D commitizen
```

这样就安装好 commitizen。

### 安装 cz-conventional-changelong

commitizen 支持不同适配器的扩展，不同适配器可以满足不同的构建需求的。这边使用 cz-conventional-changelog，这个采用了 Angular 团队使用的 commit message 规范。

```sh
npm i -D cz-conventional-changelog
```

安装完之后，在 package.json 里添加如下信息：

```json
"config": {
  "commitizen": {
    "path": "node_modules/cz-conventional-changelog"
  }
}
```

上面的安装和配置也可以通过下面命令进行简化：

```sh
npx commitizen init cz-conventional-changelog -D
```

安装和配置完之后，建议在 npm scripts 中添加下面 script 用于运行 git cz

```json
{
  "scripts": {
    "commit": "git-cz"
  }
}
```

这样后续就可以通过 `npm run git-cz` 来代替 `git commit`，运行后就会以交互性方式选择和填写完成 commit message 所需的步骤。

## @commitlint/cli, @commitlint/config-conventional

commitizen 为填写规范化的 commit message 提供了便利性。但是没有对信息规范化做校验和拦截。即直接通过 git commit 命令提交代码，然后填写不规范的 message，也是可以提交成功。

这两个工具就是用于解决上面的问题，通过加入到 husky 'commit-msg'，可以在提交前做进一步校验，确保不会提交不规范的 message。

```sh
npm i -D @commitlint/config-conventional @commitlint/cli
```

首先安装下包，之后新增 commitlint.config.js 文件，在文件中添加如下内容：

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

之后修改下 husky 配置信息，定义 'commit-message' hook：

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-commit": "lint-staged"
    }
  }
}
```

至此，提交代码时，commit-message 就必须遵循要求的格式才能提交成功 (这边用的是 cz-conventional-changelog 这个 adapter)。由于 commitizen 为编写 commit message 提供了便利性，因此建议使用 `npm run commit` 代替 `git commit`

## conventional-changelog-cli

这个工具可以根据 commit message 自动生成 changelog。commit message 可以是不同规范。

```sh
npm i -D conventional-changelog-cli
```

首先安装 conventional-changelog-cli，之后添加 npm script

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}
```

之后功能开发完后，修改 version 后，就可以通过 npm run changelog 自动生成该版本相关的 change log。

__注意__ 这个命令是生成最新一个版本的 changelog (以 tag 区分版本)

如果之前没有生成 changelog，可以通过 `conventional-changelog -p angular -i CHANGELOG.md -s -r 0` 生成历史以来的所有 change log。这个通常是针对已有项目需要引入 changelog 才需要一次生成。通常应该在项目一开始就进入，这样可以将 change log 和版本对应起来。