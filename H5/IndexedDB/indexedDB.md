indexedDB
======================

## 步骤

使用 indexedDB 操作步骤一般如下：
1. window.indexedDB.open() 得到一个 request，在 request.onscuccess 中设置 db 对象
2. 通过 db.transaction() 开启指定 objectStore 的 transaction
3. 通过 transaction.objectStore() 获取指定 objectStore 的操作权限
4. 通过 objectStore 进行操作 (get, put, delete 等) 得到对应的 request 对象
5. 通过 request.onsuccess 得到操作结果

## 特性

1. 使用 key-value 键值对存储数据
2. IndexedDB 是事务模式的数据库
3. IndexedDB 的API 基本是异步模式
4. IndexedDB 数据库请求无处不在，即通过 request 对象进一步获取操作结果
5. IndexedDB 在结果准备好之后通过DOM事件通知用户
6. IndexedDB 是面向对象，而不是采用二维表来表示集合的关系数据库
7. IndexedDB 不使用 SQL 语言
8. IndexedDB 采用同源策略