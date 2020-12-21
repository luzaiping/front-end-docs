适配
================

## 基础概念

### 物理像素

指的是一个设备真实所拥有的像素，也就是可以展示多少个像素；通常我们所说的像素都是指这个概念；比如 iphone 6 的物理像素是 750 x 1334，常见的显示像素 1024 * 768，也是指物理像素

### dp 设备独立像素

Device Independent Pixels，简称 DIP 或者 DP；这个值跟每个设备有关，设备生产后就确定了，不能更改。

设备独立像素也称为密度无关像素，可以认为是计算机坐标系统中的一个点，这个点代表一个可以由程序使用的虚拟像素(比如说CSS像素)，然后由相关系统转换为物理像素

查看各个设备的 DP，可以通过 chrome -> 选择移动端模式；左侧选择设备，右边输入框的值就是对应的设备独立像素

比如 iphone6 的 DP 是 475 x 667， iphone 6 plus 的 DP 是 414 x 736

### dpr 设备像素比

全称是：Device Pixel Ratio

web 中可以通过 window.devicePixelRatio 获取，css 中可以通过 min-device-pixel-ratio 区分 dpr：

```css
@media (-webkit-min-device-pixel-ratio: 2),(min-device-pixel-ratio: 2){ }
```

RN 中可以通过 PixelRatio.get() 获取 dpr

公式：dpr = 物理像素 / 设备独立像素

这个也有例外的情况，比如 iPhone 6、7、8 Plus 实际像素是 1080 x 1920，而设备独立像素是 414 x 736，dpr 却是 3；将 设备独立像素 乘以 3，得到的实际物理像素是 1242 x 2208；针对这种情形，手机会自动将 1242 x 2208 个像素点塞进 1080 * 1920个物理像素点来渲染。这边的 1242 x 2208 称为屏幕的 `设计像素`, 实际开发过程中也是以这个 设计像素 为准

在苹果提出 Retina 概念之前，移动设备都是直接使用物理像素来进行展示。

### viewport

layout viewport: 布局视口，可以通过 document.documentElement.clientWidth / clientHeight 获取
visual viewport: 视觉视口，可以通过 window.innerWidth / innerHeight 获取
ideal viewport ：理想视口，网站页面在移动端展示的理想大小。可以通过 screen.width / height 获取。

对页面进行缩放，不会影响 layout viewport，但是会影响 visual viewport，对页面进行放大， visual viewport 就会变小，反正就会变大

页面的缩放系数 = css 像素 / 设备独立像素
页面的缩放系数 = ideal viewport / visual viewport
页面的缩放系数 = 1 / dpr = 设备独立像素 / 物理像素

比如 iphone 6，如果页面缩放系数是 0.5：

ideal viewport: screen.width = 375 这个是不变
visual viewport: window.innerWidth = 750  





