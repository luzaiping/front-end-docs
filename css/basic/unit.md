css 常见单位说明
=================

## physical pixel  物理像素

物理像素，也称作 设备像素，是显示设备中一个最微小的的物理部件。每个像素可以根据操作系统设置自己的颜色和亮度。对于 retina 屏幕，单个物理像素是无法用肉眼看出来。

## dip (Device-independent Pixel) 设备独立像素 也称作 dp (device pixel)

也成为密度无关像素，可以认为是计算机坐标系统中的一个点，这个点代表一个可以由程序使用的虚拟像素(比如css像素), 由相关系统转换为物理像素。

这个概念跟屏幕密度有关。 dip 可以用来辅助区分是否是 retina

## dpi / ppi / Pixel Density  屏幕密度

Dots per Inch: 屏幕上每英寸有多少个点，一般是用于描述打印设备

Pixel Per Inch：monitor 和 image 没有 dot 这个概念, ppi 和 dpi 这2个概念是等同。 比如 iphone 7 的 ppi 是 326

屏幕密度是指一个设备表面上存在的像素数量，通常用 PPI 来表示。

## css像素

是一个抽象的单位，主要使用在浏览器，用来精确度量web页面上的内容。一般情况，css像素也成为与设备无关的像素(device-independent pixel), 简称 DIPs

## dpr (Device Pixel Ratio) 设备像素比

定义了物理像素和设备独立像素的对应关系 也称做 CSS Pixel Ratio

dpr = 物理像素 / 设备独立像素 ( 这里面的内容可以不对： 公式： dpr = device pixel / css pixel )

在 JS 可以通过  window.devicePixelRatio 获取到这个值

在 css, 可以通过-webkit-device-pixel-ratio，-webkit-min-device-pixel-ratio 和 -webkit-max-device-pixel-ratio进行媒体查询，对不同dpr的设备，做一些样式适配(这里只针对webkit内核的浏览器和webview)

比如 iphone6 的设备宽高是 375pt * 667pt, 这个可以理解为设备的独立像素；而它的 dpr 是2，根据上面公式，可以得到其物理像素是 750pt * 1334pt

在不同屏幕上，css像素所呈现的物理尺寸是一致，不同的是css像素所对应的物理像素是不一样。普通屏幕也就是dpr=1，1个css像素就等于1个物理像素。如果dpr=2，那么1个css像素就等于4个物理像素(2*2)

因此做移动端适配，除了要适配layout，还得考虑图片的适配。

## resolution 分辨率

分辨率： 表示屏幕上显示的物理像素总和。 可以参考 [常见设备分辨率](https://docs.adobe.com/content/help/en/target/using/experiences/vec/mobile-viewports.html)

比如 iphone7 的分辨率是 750 x 1334 pixel, 表示横向有 750 个像素， 纵向有 1334 个像素， 这个像素指的是设备像素.

## pt

pt： point 的简写，对于 standard-resolution screen, 1pt = 1px

关于这些单位的说明及其关系，可以参考这个[链接](https://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions)

## font-size / layout 相关的单位

### px / em / rem / vw / vh / vmin

px   就是具体的像素，比较适合布局使用
em   是相当于 parent 的font-size 来计算，如果 parent 没有指定，就一路往上直到找到有定义 font-size 的祖先，这个目前比较少用
rem  相当于 root element font-size 进行计算，如果 root element (也就是 html 元素) 没有定义，就用 browser 的 default font-size (16px). 通常为了计算方便，会将 html 的 font-size 设置为

```css
html { font-size: 62.5% }
body { font-size: 1.6rem }
```

也就是 16px * 62.5% = 10px, 这样就方便后续进行计算。

vw: 相对于 viewport width, 1vw 就是 1% viewport witdh
vh: 相对于 viewport height, 其他跟 vw 类似
vmin: 取 vw 和 vh 中的最小值，即 min(vw, vh)

后面这3个单位特别适合用于 responsive design