# 对性能优化的认识

页面绝大多数的时间是花在下载资源上面，而不是渲染显示。提升资源下载速度可以从两方面入手，一是减少资源大小，资源越小下载速度就会越快；二是减少请求数(相比http/1而已)。

## 减小资源大小

### minify

  像 html/js/css 这类文本型的资源，部署到生产环境前，要借助 minify 工具进行处理，minify 主要是去掉 空格、空白行、注释；通过 minify 后，能有效减少资源大小，同时不影响任何功能。

  对于js，还可以通过 uglify 处理，缩短变量名和方法名

  SVG 本质是文本型的图片格式，可以通过 svgo 进行优化

### gzip

  minify 后的html/js/css，可以通过 GZIP 进一步减少资源大小；GZIP 比起minify 能更显著减少资源大小。

  GZIP 需要服务端配合，通常是配置web server，开启 compression 设置，这样最终资源的 response header 里会包含 Content-encoding: gzip 的信息；浏览器自动识别这个header，解析response

  GZIP测试：http://www.gidnetwork.com/tools/gzip-test.php

  __注意__: 一些文件格式本身就已经是压缩后的资源，比如：JPEG,PNG,GIF,WOFF，所以不需要对这些文件采用上面的压缩方式进行处理


## 减少请求数

### 合并图片

  最常见的就是 Sprite 的使用，将一些小图片集合到一张大图片上面，然后通过 css 显示对应图片区域。采用这种方式，能将对几个小图片的请求合并成一个请求，有效减少请求数。不过带来的缺点是增加获取对应图片区域的使用复杂度。

### inline css/js

  对于一些特定页面的样式和逻辑，如果内容不多，可以将这些内容直接写到 html 文件里，这样就无需额外去加载特定的 css/js 文件。带来的一个问题是增加了 html 文件的大小，所以需要取舍。

### 图片采用 data-uri 格式

  类似于 inline css/js，图片可以以 data-uri 的格式被使用，通常在css background 和 html image 标签里会见到。采用这种方法，图片是被转成 base64 格式直接嵌入到 css/html 文件里，不需要额外的http 请求。

  当然这种方式也有缺点，通常转成base64格式后，图片大小会更大，同时也增加了 css/html 文件大小，因此也不能滥用这种优化方法。

### http cache

  相比于前面提到的优化手段，缓存对于性能的提升是最明显的。通过缓存，可以省去最耗时的 http 请求，资源直接从 内存、硬盘中获取。

  http cache 的使用就是设置 Cache-Control 请求头，配置资源的缓存策略。对于一些基本不怎么会修改的资源，可以长时间的缓存，比如百度首页的logo图片。还有一些公共的js库，一般应用开发后也基本不会变，也可以设置长的缓存时间。

  缓存带来的好处是很明显，当然也带来另外一个问题：如何更新内容已经发生变更的缓存？目前常用的方法是结合 ETag response 头对缓存进行校验，也可以通过编程实现(通常是在客户端和服务端共同持有一个version)

## 优化资源加载顺序

### 将 样式/css文件 放在html的顶部

  浏览器在渲染页面前，需要先构建 DOM 和 CSSOM，然后合成 Object Model，因此 css 内容要尽早加载下来，这样才不会影响页面的渲染速度。

### 将 js 脚本/文件 放在html的底部

  浏览器在解析html文档内容时，碰到js脚本/文件时时，会暂停解析，让JS引擎进行脚本执行，因此应该把 js 脚本/文件 放到html底部，否则会阻塞html的渲染，影响页面的展现速度。

## 其他

### 不要过度使用开源库

  开源的库/框架给我们开发带来很大的便利性，比如jquery，但是如果只是使用这个库的一小部分功能，而把整个库/框架都引入进来，就有点得不偿失。 像这种情况，建议是通过原生js/css来实现。

### http2

  上面提到的一个优化方式是__减少请求数__，这个是基友使用 http/1 的前提；如果使用 http/2，就不需要那些优化手段。http/2 是一个新的技术选择，解决了不少http/1的问题，不过在应用上目前可能会遇到点障碍。

  这个优化方案适合在技术选型时就确定，不太适合对已有项目/应用的优化。

### cdn

  将站点部署到cdn上，发挥电信运营商的网络优势，能有效缩短请求时间。当然这个优化方案跟前端开发没有直接关系。