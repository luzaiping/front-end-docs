# 性能优化工具

## Lighthouse

谷歌的工具，集成在 chrome DevTools 里，对应 Audits panel，从 PWA, performance, Best Practice, Accessibility, SEO 这几个维度进行评测。生成的报告里，会给出每一项的评分，以及哪些项没做好，下面会给出相应的 learn more 链接，链接到 google developer docs。

该工具是基于 mobile 设备进行评测的，可以用来测试本地环境，这个也是该工具区别于其他工具的最大特点。

官方地址：https://developers.google.com/web/tools/lighthouse/

## PageSpeed Insights

谷歌的工具，一个在线评测工具，输入要评测的 web url，点击 ANALYZE 按钮，然后等待结果出来。

评测结果包含 Mobile 和 Desktop 两个tab，分别给出对应环境的数据，最上面给出 Speed 和 Optimization 的得分情况，下面的 Page Stats 列出 Optimization Suggestions 和 Optimizations Already Present：

+ Suggestions 部分给出可以优化的项，点击底下的 show how to fix，会详细列出可以优化的细节以及对应 developer docs 的链接。
+ Present 部分列出已经优化的项，这个一般看下就好了，重点还是 Suggestions 部分

页面最下方还会给出意见优化好的 images/js/css 资源，可以直接下载，然后替换掉当前使用的资源。

该工具特别适合入手，有了一定理论基础了，结合这个工具的测试报告，分析 suggestions，然后看下要怎么对应优化，如果有不清楚的地方，可以查看相应的文档加深理解。使用这个工具，多分析和优化几个例子，通过理论和实践相结合的方式，能快速地提升分析和优化技能。

官方地址：https://developers.google.com/speed/pagespeed/insights

## Pingdom

同 PageSpeed Insights，输入要评测的地址即可。这个工具还可以选择从哪个地方进行评测(有4个测试地址，都是欧美地址)，这也算是这个工具的一大特色。

评测结果最前面是一个 summary，比较有用的是 Load Time，Page size，Requests  这3个数据，能够一眼就看出网站加载时间、总的加载大小、总的请求数，非常直观

再往下是一个 Performance Insights，会给出每一项评测的等级(用字母来表示等级，从A-F，A是最高，F是最低)，点开每一项，会列出详细的信息和参考资料，参考资料是链接到 google developer docs。这个功能跟 PageSpeed Insights 类似，可以作为 PageSpeed Insights 的补充。

往下是4个表格，分别对应 每种类型的内容大小、每种类型的请求数、每个域名的内容大小、每个域名的请求数；这4个表格内容很直观，一眼就能看出所需的数据

最后是具体的 file requests，类似于 DevTools 的 waterfall；视觉上要比 waterfall 美观，还可以排序和过滤；每一个清楚展开后，可以看到信息的 request 和 response 信息。这块的内容跟 chrome DevTools 的 Networks panel 很像。

这个工具用来截图一些数据比较合适，功能同 PageSpeed Insights 和 DevTools 有重复。

## webpagetest

这个工具是在移动设备上对站点进行测试，也有选择测试地点，还可以选择测试设备类型，浏览器。有 Advanced Testing 和 Simple Testing 两种模式。

另外一大特点是每次测试实际会运行 3 次，然后取平均值。

测试包括也是最全，有好几个 tab 页，另外还有饼图，可以看出 请求数，请求大小 等等

还有个 image analysis 链接，点击后会跳到单独的页面，页面列出当前测试页面里可以优化的图片，并且给出可选的图片格式，以及每个格式优化后的大小，并提供下载链接。也就是说决定好要哪张优化后的图片，直接下载覆盖当前使用的图片即可，特别方便。

这个工具应该是提升性能优化技能的一大利器。

## 总结

除了这4个工具外，还有其他的工具，比如 Yslow；不过能掌握和使用好上面那4个就够了；还有测试的时候，不能只适用单一工具，应该多个工具一起用；因为每个工具的测试点、测试标准、算法都不一样，只有结合多个工具的测试结果，最终的结果才是更全、更准确。