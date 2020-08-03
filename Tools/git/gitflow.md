# GitFlow 的使用

## 流程

1. 基于master分支，创建develop分支，并同步到远程仓库

1. 基于develop，创建feature分支，比如 feature/emontional，feature的开发都是在这个分支上实现

1. 如果还有新的feature需要同步开发，也基于develop分支创建新分支

1. feature分支开发结束后，merge 到 develop 上；这时候 feature 分支就不需要了，可以考虑删除；在没有release发布需求的情况下，如有需要修改，直接在develop上修改

1. 如果有其他feature分支也开发完了，这时要看下之前的feature是否要作为单独release发布，如果要的话，应在其他feature合并进来前创建release；否则的话直接merge其他feature

1. 开发和测试环境是基于release分支发布，这个阶段的修改都在release上修改，等这个release稳定了，再merge到develop，同时也merge到master

1. release修复bug的时间段内，develop可以merge其他feature分支或hotfixes，或者对其他feature合并进来后的内容进行优化和bug修复

1. 基于merge完release的master分支发布预生产和生产环境，同时基于master分支创建hotfixes分支；hotfixes用于修改预生产和生产环境的bug，改完后需merge到master 和 develop；merge到master是为了发布用，merge到develop是为了保持develop始终是最新

1. release merge 到 master后，就不会再用了，可以考虑删除。可以根据需要，merge到master后，加上tags

## 各分支的职责

### master分支

包含已经发布或即将发布的稳定代码，不可以在这个分支上直接修改，只接受 release 和 hotfixes 的合并

### develop分支

包含已经开发完的所有代码 和 hotfixes 的bug修复，这个分支上的功能是最全，接受 feature 和 hotfixes 的合并，feature合并后还不需要发布新release前，可以直接在这个分支上修改。

### feature分支

作为开发一个新功能的独立分支，功能完成后，合并到develop上；合并之前，要考虑下这个feature是否要作为下一个release的内容，如果不是，需在下一个release分支创建好后，才可以合并到develop上(根据工作优先级来排，通常不会有这样的情况)

### release分支

基于develop分支创建，不包含不发布的feature内容，因此要在其他feature分支合并前创建好release，这个分支是用于发布开发和测试环境，如有bug，则直接在这个分支上修改，稳定后把这个分支合并到develop 和 master，然后就可以删除了

### hotfixes分支

这个分支类似release分支，仅用于修改预生产和生产环境的bug，改完后需合并到master和develop