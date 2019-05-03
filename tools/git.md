# Git 学习笔记

## Git 配置文件

配置文件分为3种，包括Project配置文件，global配置文件，system配置文件

### 1. Project的配置文件

具体某个Project的配置文件，配置信息只适用于当前Project

+ 文件路径：存放在具体project的 .git/config 里
+ 通过命名行配置: git config name=value (要求在project目录里执行)

### 2. 全局配置文件

多个Project共享的配置文件，比如 account 信息一般就是存放在该文件里

+ 文件路径： ~/.gitconfig (比如我的电脑对应的路径就是：C:\Users\Administrator\.gitconfig)
+ 通过命名行配置： git config --global name=value

``` UnKnown
[user]
    name = luzaiping
    email = luzaiping@163.com
```

### 3. 系统配置文件

应该是针对不同操作系统的配置文件，这个文件很少用到，了解即可

+ 文件路径： C:\ProgramData\Git\config (windows下的路径，其中ProgramData是隐藏文件夹，所以需要设置隐藏文件夹可见才能看到)

### 4. 优先级

很明显这3个文件夹的优先级就是  project > global > system

### 5. 查看配置信息

查看所有配置信息：

``` Bash
git config --list
```

查看某个name的配置信息：

``` Bash
git config keyName
```

## 配置 SSH 连接 github

这个适用于SSH协议，配置是为了不用每次请求都要重新输入认证信息

[关于SSH的配置和使用](https://help.github.com/articles/connecting-to-github-with-ssh/)，这个链接里提供了SSH的配置，内容很详尽；包括检查，生成，以及结合GitHub的配置。这边就不再单独记录了.

---
说明：GitBook 目前不支持SSH，只支持Https，所以没有SSH配置的内容。关于如何配置认证信息，Gitbook提供了设置'~/.netrc'文件的办法，不过在个人电脑上试了没有成功；在公司电脑就可以，具体原因只能是后续有机会再研究。Gitbook关于结合git的文章链接如下：[GitBook 结合 Git](https://help.gitbook.com/books/how-can-i-use-git.html)

## Git 远程仓库

### 查看远程仓库信息

+ 查看远程仓库

``` Bash
git remote
```

+ 查看远程仓库详细信息，包括所有branch 及 跟本地的跟踪分支建立情况，这个命令最常用

``` Bash
git remote show <remote-name>
```

+ 其他命令

``` Bash
git remote -v
git ls-remote <remote-name>
git branch -r  查看远程有哪些分支
```

### 远程分支的协作

+ 获取一个远程仓库

要获取远程仓库，可以通过clone的命令来实现

``` Bash
git clone [-o another-remote-name] url
```

中括号的内容一般不提供(默认是origin，如果提供就是修改remote name)，这样会clone一份远程的仓库到本地，本地的文件夹名称会跟远程仓库名一样

+ 关联本地仓库和远程仓库

假设已经有一个远程的仓库，本地也通过 git init 建立了一个仓库，那么可以通过下面的命令(在本地仓库目录下运行)，将这2个仓库关联起来

``` Bash
git remote add <remote> url
```

+ 推送本地的分支到远程，让其他人可以在这个分支上工作

``` Bash
git push -u <remote> <local-branch-name>[:remote-branch-name]
```

这条命令，后面中括号的内容是可选，如果没有提供，则跟本地分支名一样，一般无需提供，保持一致比较好。

运行完这条命令后，远程仓库就会有一个对应的分支了，-u 这个参数表示当前这个是跟踪分支，即这时候可以直接用 git push 和 git pull 来推送或拉取这个分支的内容；当然也可以手动输入对应的仓库和分支名：

``` Bash
git pull <remote> <remote-branch-name>
git push <remote> <local-branch-name>
```

不过每次都要输入远程仓库名和分支显得比较麻烦；

假如在第一次push的时候忘了 __-u__ 这个参数，是只有git push建立了关系，git pull 还没有；那么可以通过下面这2条命令再建立关联，这样就可以直接git pull：

``` Bash
git branch --set-upstream-to=<remote>/<remote-branch-name> [<local-branch-name>]
git branch -u <remote>/<remote-branch-name>
```

这个对于创建分支并且推送到远程的创建者比较适用；而对于其他协作者，可以通过建立跟踪分支，直接就可以push 和 pull

+ 获取远程新的远程信息到本地

``` Bash
git fetch <remote>
```

这条命令会获取 remote server 的最新信息到本地的 origin/xxx 分支上 (具体是哪个分支，由 upstream 设定)

``` Bash
git merge <remote>/<remote-branch-name>
```

将从服务端获取到最新信息的 origin/xxx 分支。git pull  是上面这2条命令的shorthand

### 跟踪远程分支

从远处仓库 checkout 下来的分支就叫 *跟踪分支* (tracking branch)，跟踪分支就是和某个远程分支有建立联系的本地分支，所以可以直接使用 **git push** 和 **git pull** 同远程仓库进行数据交互，Git知道具体是同哪个分支交互，因为已经建立好了跟踪信息
### 跟踪远程分支

从远处仓库checkout下来的分支就叫 *跟踪分支* (tracking branch)，跟踪分支就是和某个远程分支有直接联系的本地分支，所以可以直接使用 **git push** 和 **git pull** 同远程仓库进行数据交互，Git知道具体是同哪个分支交互，因为已经建立好了跟踪信息

下面2条命令都可以创建跟踪分支，两条命令的作用是等同（这2条命令适用于本地还没有对应分支，需要checkout的情况）

``` Bash
git checkout -b <local-branch-name> <remote>/<remote-branch-name>
git checkout --track <remote>/<remote-branch-name>
```

最后一条命令是上面两条命令的简写，这条命令只有 本地没有 branch-name 这个分支，并且只关联一个 remote，并且 remote 上也有 branch-name 这个分支，那么就会在本地建立 tracking-branch

远程分支名称不可以忽略，否则会默认关联到master

### 删除分支

feature分支的生命周期比较短，merge到开发分支后，就可以删除了，可以在主分支上运行下面这2个命令，查看目前分支的merge情况

``` Bash
git branch --merge
git branch --no-merge
```

--merge 列出的 分支 都是已经合并了，可以安全删除，通过下面这条命令执行本地删除

``` Bash
git branch -d <local-branch-name>
```

删除完本地后，可以通过更新远程的删除

```Bash
git push <remote> --delete <branch-name>
```

### rollback

rollback分3种情况：

#### 回退working directory的修改

``` Bash
git checkout -- <filename>
```

回退(撤销)在工作区的文件修改，这个只针对已经加入git管理的文件，如果是新建文件，还没有通过git add加入git管理的话，那么这条命令是无效的；没有加入到git管理的文件，如果要放弃修改，可以直接删除文件

#### 从stage area 回退到 working directory

``` Bash
git reset HEAD <filename>
```

将 stage area 的文件回退到 working directory. 即通过git add加入到stage area，但是又想撤销git add，那么就可以通过这条命令来实现

#### 撤销git commit

``` Bash
git reset --hard <expected_commit_id>
git reset --hard HEAD^
git reset --head HEAD^^
```

通过git commit提交了某些文件，现在要撤销commit，可以通过该命令实现，回退到前一次commit 通过 —__HEAD^__ , 回退到前两次commit 通过 __HEAD^^__, 回退到任意一次commit，通过 __expected_commit_id__ 实现。

注意：这条命令会直接回退到指定的commit所在的版本，那么两个commit之间所有的修改都会被放弃，包括还没 git add 或者 git commit 的文件。所以要慎用和条命令，以防修改的内容被撤销没了。

### rebase

``` bash
git checkout feature/basic
git rebase master

git checkout master
git merge feature/basic
```

前面2句可以合成一条

```bash
git rebase master feature/basic
```