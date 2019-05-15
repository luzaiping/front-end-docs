immutable: 1、如果性能影响小，优先考虑现有的immutable 实现方式； 对于改动比较频繁，而且是重要功能，性能影响又比较大，才需要考虑引入immtable.js
               2、const 变量的理解
               3、object.freeze(obj) 只是shadow immutable
               4、对于接收参数，统一在函数内将其转换为新的引用，然后再操作，这样就永远不用担心会修改输入参数的值，也可以确保该函数是pure function
               5、可以对function的local 变量进行修改，这样不会产生 side effect
               6、 array 的 concat, slice，map，filter， reduce， reduceRight 是不可变方法