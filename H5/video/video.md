H5 Video 采坑记录
===============

这边主要针对手机端H5，包括 ios, android, 微信小程序

## poster 封面图

### 设置 poster 属性

设置视频封面最简单的方法就是设置 poster 属性, 值为图片地址。不过这个属性对 ios 浏览器无效，如果要给 ios 浏览器设置封面图，可以通过额外的 `<img>` 元素来设置封面图。

### 视频第一帧作为封面图

第一帧作为封面图，对于 ios，android，微信小程序 都不是默认行为，即不会自动第一帧作为封面图。

#### ios app/浏览器

可以在视频 url 后面加上 `#t=time` 这种形式的 hash, ios 会自动截取从 time 开始的视频内容

```html
<video src='./video.mp4#t=0.1'>
```

上面这个会自动截取从0.1秒开始的视频内容，ios 会自动将0.1秒的那一帧作为视频封面图

#### android app/浏览器/微信小程序

android 不会自动获取视频第一帧作为封面图，需要通过 canvas.drawImage 将视频作为 source 绘制图片来模拟封面图.

这种方案不能直接在 `loadeddata` 时就 dragImage, 因为在手机浏览器里绘制出来的是纯黑色底图，而是要先播放一小段时间再绘制：

```javascript
function setCanvasPoster() {
  this.videoElem.play();

  let intervalId = setInterval(() => {
      if (this.videoElem.currentTime > 0.1) {
          this.videoElem.pause();
          clearInterval(intervalId);

          const width = this.videoElem.videoWidth;
          const height = this.videoElem.videoHeight;
          this.canvasElem.setAttribute('width', width);
          this.canvasElem.setAttribute('height', height);
          this.canvasElem.getContext('2d').drawImage(this.videoElem, 0, 0, width, height);
      }
  }, 0);
}
```

上面这段是核心代码，先让视频播放，然后通过定时器检测视频播放时间，一旦播放时间超过指定的时间(这边是0.1秒), 就暂停视频播放，清除定时器，然后设置 canvas 的宽高，最后通过 canvas 对应的 context.drawImage 绘制图片。

这种方式，需要提供一个跟video一样宽高的 canvas, 通过 canvas 设置封面, 等点击播放按钮后，隐藏 canvas，显示 video

这种方案，对于视频源没有要求，可以是本地也可以是远程服务器的视频。

如果是本地视频，可以进一步通过 canvas 的 toDataURL 将 canvas 转换成 base64 格式的data URI，然后将 data URI 作为 video poster，这样就可以全程隐藏canvas，无需切换 canvas 和 video 显示和隐藏：

```javascript
canvasElem.getContext('2d').drawImage(myVideo, 0, 0, width, height);
dataURL = canvasElem.toDataURL('image/jpeg'); //转换为base64
myVideo.setAttribute('poster', dataURL);
```

其中 HTMLCanvasElement.toDataURL() 要求 canvas 的 source 要嘛是本地，要嘛是支持 cors 的服务器资源。

#### 微信小程序

如果是 android 小程序可以采用上面的方式来实现。 这边主要针对 ios 微信小程序 情形进行说明。

ios 微信小程序 (包括 ios 微信浏览器，目前仅测试了 iphonex 和 iphonexr) 首次不会自动触发视频的加载，也就是 loadeddata, canPlay 等一系列视频事件都不会触发，需要手动执行某些操作(比如点击 播放 或者 切换 tab 页) 才会触发事件。针对这种情况，只能先设置视频poster, 让用户先点击播放按钮，然后显示 loading，等 canPlay 被触发后，再开始真正的播放。

```javascript
componentDidMount () {
    if (webchatSDK.isWxEnv()) {
        this.initVideo(); // 初始化视频, 比如视频显示，播放按钮显示
        this.videoElem.setAttribute('poster', this.props.poster);
    }
}

onPlayClick = () => {
    // 微信小程序 并且 视频还不能播放的情形
    if (webchatSDK.isWxEnv() && !this.state.canPlay) {
        // 还没加载完，点击播放，先显示loading，隐藏播放
        this.setState({loadingIconVisible: true, playIconVisible: false});
        this.videoElem.play(); // 只有执行这个方法，才会开始加载视频

        // 启动定时器检测视频是否加载完成
        const timerId = setInterval(() => {
            if (this.state.canPlay) {
                // 视频已经加载完并可以播放，关掉定时器
                clearInterval(timerId);
                this.videoElem.currentTime = 0; // 重置播放进度为开始状态
                this.setState({loadingIconVisible: false, playIconVisible: false, isPlaying: true});
                this.videoElem.play();
            }
        }, 500);
    } else {
        this.videoElem && this.videoElem.play();
        this.setState({playIconVisible: false, isPlaying: true});
    }
}

// 微信小程序不需要再次初始化 video
onCanPlay = () => {
    !this.state.canPlay && !webchatSDK.isWxEnv() && this.initVideo();
    this.setState({canPlay: true}); // 设置可以播放
}

```

android 微信小程序，可以采用这个方案，也可以采用上面 android app/浏览器/小程序 的方案。

这个方案比较类似淘宝目前的做法，先显示 poster, 点击播放按钮，开始视频加载，等可以播放时就自动播放。

__注意：__ 视频加载后要直接执行 video.play()，需要视频是静音的状态(muted), 否则会抛出异常，阻止播放。后续暂停/播放就不要求是否是静音状态。

## 其他事项

### object-fit: fill

通常设置 `object-fit` 让视频填充满这个 div

### 内联播放

android 默认就是内联播放。 ios 需要设置 playsInline 和 webkit-playsinline (支持 ios 10 以下版本), 其中 webkit-playsinline 只能通过 DOM 来设置, 不能作为 react props 来设置

```javascript
<video playsInline />

componentDidMount () {
  this.videoElem.setAttribute('webkit-playsinline', 'true');
}
```

### 全屏播放

android 支持全屏播放， ios 全屏 和 内联播放是互斥, 只能使用一种 (只在 ios webview 测试)：

```javascript
const enterFullScreen = (elem) => {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
};
const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
};
```

enterFullScreen 要指定全屏的 dom element (通常就是 video element)。 exitFullscreen 退出全屏只能是通过 document 来执行，而不能是指定的 dom element, 因为指定 dom element 没有 exitFullscreen 方法。

### 播放进度条

播放进度条主要包含 当前播放时间，视频总时长, 进度条。 这个功能主要涉及到视频的 currentTime, duration, onTimeUpdate 事件

视频总时长在 onLoadedData 时就能知道 (甚至更早, 比如 loadedMetaData), 而且设置后就无需再修改

当前播放时间，进度条 这2个信息，就需要在视频时间每次发生变更后进行更新:

```javascript
function onTimeUpdate() {
  const percent = this.videoElem.currentTime / this.videoElem.duration;
  const progressStr = secondToDate(this.videoElem.currentTime); // 当前播放时间
  const progressPercent = (percent * 100).toFixed(1); // 当前播放进度占总播放的百分比，这个用于设置 播放进度条 的样式
  this.setState({progressPercent, progressStr});
}
```

```html
<div className='banner-video-progress-wrap'>
    <div className='banner-video-progress-play' style={{ width: `${progressPercent}%` }}></div>
</div>
```

播放进度条的样式，可以通过2个 div 来实现，`banner-video-progress-wrap` 这个 div 用于显示总播放进度条, `banner-video-progress-play` 用于显示已经播放的进度条，通过设置 css width，也就是上面 js 计算出来的百分比来显示。两个 `div` 设置不同 `background-color` 进行区分。