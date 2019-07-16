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
git config user.name
git config user.email
```

后面的 user.name 和 user.email 替换成要查看的 key name 即可

## 配置 SSH 连接 github

这个适用于SSH协议，配置是为了不用每次请求都要重新输入认证信息

[关于SSH的配置和使用](https://help.github.com/articles/connecting-to-github-with-ssh/)，这个链接里提供了SSH的配置，内容很详尽；包括检查，生成，以及结合GitHub的配置。这边就不再单独记录了.

---
说明：GitBook 目前不支持SSH，只支持Https，所以没有SSH配置的内容。关于如何配置认证信息，Gitbook提供了设置'~/.netrc'文件的办法，不过在个人电脑上试了没有成功；在公司电脑就可以，具体原因只能是后续有机会再研究。Gitbook关于结合git的文章链接如下：[GitBook 结合 Git](https://help.gitbook.com/books/how-can-i-use-git.html)

## Git远程仓库相关操作

### 查看远程仓库信息

查看远程仓库信息可以通过 git remote 命令：

``` Bash
git remote
```

这个会列出每个远程仓库的简短名称。可以后面加上 -v (--verbose 的简写), 能显示更完整的信息:

```bash
git remote -v
```

也可以通过 show remote-name，显示仓库的所有 branch 及跟本地仓库分支的关联关系(push 和 pull)

``` Bash
git remote show origin
```

### 其他命令

``` Bash
git ls-remote <remote-name>
```

这个命令能看到各个 tag 和 merge-request 信息，不常用，等有进一步了解再补充。

```bash
git branch -r
git branch -a  
```

git branch 用于查看分支, 加上 -r 只显示远程分支, 加上 -a 显示本地和远程所有分支

### 获取一个远程仓库到本地

要获取远程仓库，通常是通过clone命令来实现

``` Bash
git clone [-o another-remote-name] url
```

中括号的内容一般不提供(默认是origin，如果提供就是修改remote name)，这样会clone一份远程的仓库到本地，本地的文件夹名称会跟远程仓库名一样

### 添加远程仓库

假设已经有一个远程仓库，本地也通过 git init 建立了一个仓库，那么可以通过 git remote add [shortname] [url]，为本地仓库增加新的远程仓库

``` Bash
git remote add pb git://github.com/paulboone/ticgit.git
```
shortname 是指定的远程仓库名称，通常就是 origin, 也可以根据需要自定义成其他更有意义的名称, 比如 paul (paul 的仓库)

### 抓紧远程仓库的数据

获取远程仓库数据可以通过 git fetch [remote-name]

这个命令会到远程仓库中拉取所有本地没有的数据。运行后，就可以在本地访问该远程仓库的所有分支，将其中某个分支合并到本地，或者只是取出某个分支，查看里面的内容。

通过 git clone 复制一个远程仓库后，这个命令会自动将远程仓库归于 origin 下。通过 git fetch origin，会抓取别人上传到这个远程仓库中的所有更新到本地。

git fetch 只是将远程数据拉到本地仓库，并不会自动合并到当前工作分支，如果要合并需要手动操作。

比如远程有一个 serverfix 分支，通过 git fetch origin，本地仓库会多一个 origin/serverfix, 指向远程的 serverfix。这时候本地还没有可编辑的 serverfix 分支，需要通过 git merge origin/serverfix 将这些工作合并到当前工作的分支。

如果要合并到本地 serverfix 分支，那就得先本地创建 serverfix 分支，然后在该分支上执行 git merge。也可以通过下面命令快速实现

```
git checkout -b serverfix origin/serverfix
```

这个命令会基于 origin/serverfix 创建一个新的本地分支 serverfix。

如果是为本地某个分支设置了跟踪远程分支，可以使用 git pull 抓取远程数据下来，并且自动将远程分支合并到本地当前分支。 git pull 相当于是 git fetch 和 git merge 的组合。 

通过 git clone 会自动创建本地的 master 分支用于跟踪远程仓库的 master 分支。对于其他分支，就需要手动设置跟踪。

### 推送本地的分支到远程

本地分支需要跟其他人共享进行协同工作，就需要将本地分支推送到远程仓库， 可以通过 git push [remote-name] [branch-name] 实现

```bash
git push origin serverfix
```

这边将本地的 serverfix 分支推送到远程仓库 这个命令要求对 origin 远程仓库有写权限。

推送成功后，其他人就可以通过 git fetch [remote-name] 获取这个分支的数据。

如果要指定远程分支的名称，可以在本地分支名称后面加上 ':remote-branch-name'：
```
git push origin serverfix:awesomebranch
```

将本地的 serverfix 分支推送到远程仓库上的 awesomebranch 分支。 建议 push 后面加上 -u 这样会同时设置跟踪分支，就不需要后面再显示设置了。

### 跟踪远程分支

当 clone 一个远程仓库，会自动创建一个跟踪 origin/master 的 master 分支。如果要在本地建立跟踪其他远程分支，可以通过 git checkout -b [branch] [remotename]/[branch] 实现：

```bash
git checkout -b serverfix origin/serverfix
```

实现这个的前提是已经通过 git fetch origin，将远程数据拉取到本地仓库，本地已经有 origin/serverfix 分支的情况下才能建立起来。

这个命令比较常用，所有提供了一个 --track 快捷方式：

```bash
git checkout --track origin/serverfix
```
这条命令等同于上面那条命令，执行这个命令前要确保本地没有 serverfix 分支才行。

设置已有的本地分支跟踪一个刚刚拉取下来的远程分支，或者想要修改正在跟踪的上游分支，你可以在任意时间使用 -u 或 --set-upstream-to 选项运行 git branch 来显式地设置：

```bash
git branch -u origin/serverfix
git branch --set-upstream-to=origin/serverfix
```

执行完上面的命令后会提示 Branch 'branch-name' set up to track remote branch 'branche-name' from 'remote-name'. 这时候通过 git remote show origin, 就能看到设置分支出现在 Local branches configured for 'git pull'： 下面。


如果想要查看设置的所有跟踪分支，可以使用 git branch 的 -vv 选项

```bash
git branch -vv
```

#### git pull

通过 git fetch 命令从服务器上获取最新的数据到本地，这个命令并不会修改工作目录中的内容。 如果要获取并且合并，就可以通过 git pull, 这个命令相当于先 git fetch, 再 git merge。通常设置好跟踪分支后，就可以通过这个命令，获取远程仓库的数据，并将当前分支所跟踪的分支内容自动合并到本地所操作的分支上。

不过还是建议显示通过 git fetch 和 git merge 来操作。

### 删除远程分支

要删除远程分支，可以通过 git push 再带上 --delete 选项即可

```bash
git push origin --delete serverfix
```

这个命令会将服务器上的 serverfix 分支删除掉。通常分支已经合并到 master 后，就可以删除掉了。

这个命令只是从服务器上移除这个指针。 Git 服务器通常会保留数据一段时间直到垃圾回收运行，所以如果不小心删除掉了，通常是很容易恢复的。

## 本地仓库管理

### 重命名分支

重命名本地分支很容易，通过 git branch -m 即可：

```
git branch -m oldName newName
```

这样就可以将本地分支名称 oldName 改成 newName

如果分支已经 push 到远程仓库，也要同步修改远程分支名, 就需要本地改完名之后，将远程分支删掉，再 push 本地分支，再建立跟踪分支。

```bash
git push --delete origin oldName
git push origin newName
git branch --set-upstream-to origin/newName
```

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

### tag

#### 查看tag

查看所有 tags
```bash
git tag // 会显示所有 tag
git tag -l 'v1.4.2.*' // 显示所有前缀是 V1.4.2 的tag，可以是 V1.4.2.1  V1.4.2.2  等
git show v1.4        // 查看指定 tag 的完整信息
```
#### 新建 tag

##### annotated tag

```bash
git tag -a v1.4 -m 'my version 1.4'
```
上面这条创建一条 v1.4 的 tag， message 是 'my version 1.4'； -a 表示是 annotated tag

##### 签署标签

如果有自己的私钥，还可以用 GPG 来签署标签, 把 -a 改成 -S, (s 取自 signed 首字母)

```bash
git tag -s v1.5 -m 'my signed 1.5 tag'
```

##### lightweight tag

这个标签比较简单，不需要任何参数： 不需要 -a， -S 或 -m

#### 追加 tag

如果发现某个重要的提交忘了加 tag，可以后续再回来添加，再后面加上 commit hash 就可以

```bash
git tag -a v1.2 9fceb02
```
这行表示在 9fceb02 这个commit 的时候添加一个 v1.2 的 annotated tag

#### Sharing Tags

默认 git push 是不会将 tag 推送到 remote server，必须在创建后，显示推送到 remote
```bash
git push origin v1.5
```
这个会将 v1.5 tag push 到 remote。 如果有多个 tag 需要同时推送到 remote，可以使用 --tags

```bash
git push origin --tags
```
