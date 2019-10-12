1. Transparency  rgba:

	rgba(200, 54, 54, 0.5)  最后一个值代表透明度，介于0-1之间
	通常还需设置一个fallback 如

	background: red; // fallback， rgba 无效时，这个生效
	background: rgba(200, 54, 54, 0.5);

2. border-radius
	
	需设置 background 或 border 才会生效.

	border-radius: 100%; // 变成圆形
	

3. background:
	
	background-repeat: 当box大于background image，指定 background image 在哪个方向repeat，这个值必须设定在 background-image 后面才有效
	
	background-attachment: 指定 background image 的滚动方式，fixed with regard to the viewport (‘fixed’) or scroll along with the element (‘scroll’) or 	its contents (‘local’), default 'scroll'

	background-origin: specifify background positioning area for image. background-attachment 为 fixed, background-origin 无效，default 'padding-box'

	background-position: 指定 background image 相对于 background positioning area 的位置,  length|(left,center,right,top,center,bottom)|percentage
		percentage 是 相对于 width of (background positioning area - width of background image)
		比如 background position area 是 500px, image width 是 400px， percentage是20%，offset就是 20px
		default '0% 0%'

	background-size：指定 image 的大小。
		value是percentage：A percentage is relative to the background positioning area.(由background-origin和background-attachement共同决定)

		value是length的情形：The first value gives the width of the corresponding image, the second value its height. If only one value is given the 	                     second is assumed to be ‘auto’.
		
		value是auto的情形：An ‘auto’ value for one dimension is resolved by using the image's intrinsic ratio and the size of the other dimension, or 	                   failing that, using the image's intrinsic size, or failing that, treating it as 100%.
                           If both values are ‘auto’ then the intrinsic width and/or height of the image should be used, if any. If the image has neither an intrinsic width nor an intrinsic height, its size is determined as for ‘contain’.

        contain：根据ratio，将图片scale到以使得width或height能完全包含在background positioning area 的最大尺寸(scale后至少有一边是跟area对应边相等)
        cover：根据ratio, 将图片scale到以使得widht和height完全覆盖background positioning area 的最小尺寸(scale后)

    background-clip:  Determines the background painting area. padding-box|border-box, default 'border-box'. both for color and image. 
    	当 background-clip为border-box时，设置了border color
    	设置了background-color，就会出现border color 跟 background-color 或者 background-image 颜色叠加
    	(为了让效果明显，最好采用rgba设置透明度为0.5，方便观察)

4. box-sizing:
	
	'content-box': 就是之前的box model，width 和 height 是指 content 的 width 和 height，box width = content width + padding width + border width;
	'border-box': 类似IE的box model, width 和 height 是指 box 的 width 和 height, content width = box width - padding width - border width;

5. gradient: as background-image
	
	linear-gradient: linear-gradient([<angle>|to<side-or-corner>]?, <color-stop-list>)
		(https://medium.com/@patrickbrosset/do-you-really-understand-css-linear-gradients-631d9a895caf#.tu8h335pl)
		
		first argument: optional. determines the angle of the gradient, which can be expressed either as an angle with a unit (deg, rad, grad, turn) or as a side-or-corner keyword. default to bottom，equals to 180deg

		You can define this angle in 2 ways:
			by using one of the keywords: to top, to bottom, to left, to right, to top right, to top left, to bottom right, to bottom left,
			or by defining the angle with a number and a unit, e.g. 45deg, 1turn, …

		 gradient line: the line that passes through the center and along which color stops are distributed is called the gradient line

		 Color stops: <color> [<percentage> | <length>]?   

		 	percentage | length : 
		 		specify location of color stop. 0% represents start, 50% represents center, 100% represents end. 
		 		By default, the color stops are evenly spaced.

		ex. {
				background-color: red;  // fallback
				background-image: linear-gradient(45deg, red, orange 20%, white 30%, blue 50%, green)
			}


	radial-gradient:

		size: specifies the point that defines the size of the circle or ellipse
				with value: ellipse closest-side, ellipse farthest-corner, circle closest-side

		color stop: specify color stops the same way as for linear gradients.

		ex. background: radial-gradient(ellipse closest-side, blue,red )

6. box-shadow & text-shadow:

	1st: specifies the horizontal offset of the shadow.
	     A positive value draws a shadow that is offset to the right of the box, a negative length to the left
	2nd: specifies the vertical offset of the shadow.
	3rd: Specifies the blur radius.
	4th: specifies the sprend distance.
	color: specifies the color of the shadow. if not specified, taken from 'color' property
	inset: from out-box-shadow to inner-box-shadow

	text-shadow: without sprend distance and inset.

7. @viewport/viewport meta tag
	
	7.1 destop browser:

		document.documentElement.clientWidth/clientHeight: width of viewport。

		window.innerWidth/innerHeight: 等于 document.documentElement.clientWidth 加上 scrollbar 的width。

		document.documentElement.offsetWidth/offsetHeight：指html元素的宽度/高度. 通过设置html的css width和height 来修改

		zoom in or zoom out 会影响这3组值(opera不会有影响，可能是早期版本，现有版本需要验证)

		window.pageXOffset/window.pageYOffset: document滚动距离(这个不受zoom level影响)

		Event coordinates
			pageX/Y：gives the coordinates relative to the <html> element in CSS pixels.  这个用的最多
			clientX/Y：gives the coordinates relative to the viewport in CSS pixels.  其次是这个
			screenX/Y：gives the coordinates relative to the screen in device pixels. 这个基本不会用

		screen.width/height：设备的宽度或者高度，就是电脑或者手机的屏幕尺寸(物理尺寸)

	7.2 mobile browser:

		layout viewport: 布局是基于这个来做的。要比visual viewport宽。docuemnt.documentElement.clientWidth/clientHeight 来获取
		visual viewport: 是页面当前显示在屏幕上的部分。用户可以通过滚动来改变他所看到的页面部分，或者通过缩放来改变visual viewport的大小。window.innerWdith/height来计算
		ideal viewport：gives the ideal size of a web page on the device. 不同设备该值不一样，iphone该值为320
			The layout viewport can be set to ideal viewport values. The width=device-width and initial-scale=1 directives do so.
			All scale directives are relative to the ideal viewport, and not to whatever width the layout viewport has

		当进行缩放（如果你放大，屏幕上的CSS像素会变少）的时候，visual viewport的尺寸会发生变化，layout viewport的尺寸仍然跟之前的一样

		Scrolling offset：visual viewport当前相对于layout viewport的位置。这是滚动距离，并且就像在桌面一样，它被存储在window.pageX/YOffset之中

		媒体查询Media queries

			width/height使用layout　viewport做为参照物，并且以CSS像素进行度量，device-width/height使用设备屏幕，并且以设备像素进行度量。
			width/height是document.documentElement.clientWidth/Height值的镜像，同时device-width/height是screen.width/height值的镜像

		Event coordinates
			pageX/Y：仍然是相对于页面(layout viewport)，以CSS像素为单位，用的最多


	7.3 @viewport
		Descriptors: min-width|max-width|width|min-height|max-height|height|zoom|min-zoom|max-zoom|user-zoom|orientation

		@viewport {min-width: 640px; max-width: 800px; }
		@viewport {zoom:0.75, min-zoom:0.5, max-zoom:0.9 }
		@viewport {orientation:landscape }

	7.4 viewport meta tag

		<meta name="viewport" content="name=value,name=value">

			width：Sets the width of the layout viewport.
				specified value or device-width(this will set layout viewport equals to ideal viewport)

			initial-scale：Sets the initial zoom of the page and the width of the layout viewport.
				缩放是相对于ideal viewport来缩放的，缩放值越大，当前visual viewport的宽度就会越小
				initial-scale = ideal viewport  / visual viewport

				设定该值，实际上会做下面2件事：
				a. It sets the initial zoom factor of the page to the defined value, calculated relative to the ideal viewport. Thus it generates a visual viewport width.
				b. It sets the layout viewport width to the visual viewport width it just calculated.(把layout viewport的width设置成visual viewport的width)

			minimum-scale: Sets the minimum zoom level (i.e. how much the user can zoom out)
			maximum-scale: Sets the maximum zoom level (i.e. how much the user can zoom in)
			user-scalable: When set to no prevents the user from zooming.
				all scale is relative to ideal viewport


		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">

			width=device-width，所有浏览器都能把当前的viewport宽度变成ideal viewport的宽度，但是iphone和ipad是以竖屏为准
			无论是竖屏还是横屏，宽度都是竖屏时ideal viewport的宽度
			initial-scale=1，也一样可以把当前的的viewport变为 ideal viewport，但是window phone的ie不区分横竖屏
			所以理想的做法就是2个都加上，这样所有设备都正常了，这样写法是针对新开发的mobile web来用

		<meta name='viewport' content='width=400, initial-scale=1.0'>
			这个例子，2个directive都设定了layout viewport的值，一个是400，另外一个是跟ideal viewport一样(以iphone为例，竖屏ideal viewport是320，横屏是480)，最终layout viewport是取两者中的最大值，如果是竖屏那就是400，横屏就是480
			

	7.5 css pixel and device pixel

		zoom level =100%: css pixel = device pixel
		zoom level > 100%: css pixel > device pixel
		zoom level < 100%: css pixel < device pixel

		假设一个div的width是300px，页面进行缩小或放大，实际的css pixel还是300px，不会随着改变，device pixel也不会变，变的只是这2个pixel的比例
		也就是一个device pixel等于多少个css pixel。比如放大到200%，那么一个css pixel等于2个device pixel，那么页面宽度上只能放下原来一半宽度的内容了

		在iphone上，screen.width/window.innerWidth 等于 zoom level，zoom level越大，window.innerWidth越小

		window.devicePixelRatio 就是 zoom level

		devicePixelRatio = device pixel / css pixel，iphone retina，该值等于2


8. rem：
	Equal to the computed value of font-size on the root element. When specified on the font-size property of the root element, the rem units refer to the property’s initial value.

	1rem = html tag的font-size

	translate fixed pixel to proportional: target / context = result

	Device-pixel ratio: Device-pixel ratio is the number of device pixels per CSS pixel(一个css pixel 包含多少个 device pixel)，跟下面这个2个有关

		Pixel density of the device：number of physical pixels per inch(a inch 里包含多少个 physical pixel).
			A high resolution device will have a higher pixel density, and hence it will have a high device-pixel ratio .

		Zoom level of the browser：
			For the same device, a higher zoom level means more number of device pixels per CSS pixel, and hence a higher device-pixel ratio

	dppx: device pixels per CSS pixel ，也就是 device-pixel ratio
	dpi: dot per inch
	dpcm: dot per centimeter

n-3. transform 2D

	translate(): moves an element sideways or up and down. shorthand for translateX() and translateY()
		移动element的位置，偏移值是相对于element的width 和 height，适合width和height尺寸未知的情形

		ex. transform: translate(20%, 20%) ; // 位置向右偏移width×20%，向下偏移height×20%

	scale(): affects the size of the element. also applies to the font-size, padding, height, and width of an element.
		   a shorthand function for the scaleX and scaleY functions.

	ex. div {
		  width: 200px;
		  height: 200px;
		  transform: scale(2, 1.5);
		}

		将width扩大2倍，变成400px；height扩大1.5倍，变成300px

	skewX() and skewY(): tilt an element one way or the other. (倾斜). no shorthand skew function.

		ex.
		  transform: skewX(10deg);
		  transform: skewY(4deg);

	rotate(): rotates the element clockwise from its current position.(从当前位置顺时针翻滚)

		ex. transform: rotate(30deg);

	matrix(): The matrix transform function can be used to combine all transforms into one. It's a bit like transform shorthand.


n-2. transition:
		transaction-property transaction-duration transaction-timing-function  transaction-delay

		transaction-timing-function: ease|ease-out|ease-in, fade|fade-in|fade-out

			div {
			  width: 200px;
			  height: 200px;
			  background-color: red;
			}

			div:hover {
			  background-color: blue;
			  transition: background-color 0.3s fade-out 1s;
			}

			
n-1. animation:

	@keyframes
		Each @keyframes at-rule defines what should happen at specific moments during the animation. from 0% to 100%(begin->end)

			@keyframes move {
			  from { top: 0; left: 0; }
			  to   { top: 100px; left: 100px; }
			}

	property:
		animation-name: declares the name of the @keyframes at-rule to manipulate.
		animation-duration: the length of time it takes for an animation to complete one cycle.(一个animation cycle的时间)
		animation-timing-function： ease, ease-out, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2)
		animation-delay: the time between the element being loaded and the start of the animation sequence. 
		animation-direction: sets the direction of the animation after the cycle. Its default resets on each cycle.  normal|alternate
		animation-iteration-count: the number of times the animation should be performed.   number|infinite
		animation-fill-mode: forwards|backwards|both|none
		animation-play-state: pause/play the animation.  paused|running


	.box {
		 animation-name: bounce;
		 animation-duration: 4s; /* or: Xms */
		 animation-iteration-count: 10;
		 animation-direction: alternate; /* or: normal */
		 animation-timing-function: ease-out; /* or: ease, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2) */
		 animation-fill-mode: forwards; /* or: backwards, both, none */
		 animation-delay: 2s; /* or: Xms */
	}

n. flex box: IE9及其以下都不支持

	container property:
		display: flex | inline-flex
		flex-direction: row | row-reverse | column | column-reverse     决定 main axis 和 cross aixs 及其 direction
		flex-wrap: nowrap | wrap | wrap-reverse                         决定宽度不够时，是否wrap，如果wrap就会有多出来line
		flex-flow: shorthand flex-direction and flex-wrap
		
		justify-content: flex-start | flex-end | center | space-between | space-around   控制 items on maix axis 的布局
		align-items: flex-start | flex-end | center | baseline | stretch				 控制 items on cross axis 的布局
		
		align-content: flex-start | flex-end | center | space-between | space-around | stetch   控制 flex lines的布局，当flex-wrap为非nowrap

		ps: a. text in flex container is considered as flex item too.
		    b. float, vertical-align has no effect in flex container.
		    d. 可以flex box里nested flex box，哪怕nested的content是text.

		ex.
			{
				display: -webkit-box;
			    display: -moz-box;
			    display: -ms-flexbox;
			    display: -webkit-flex;
			    display: flex;
			    -webkit-flex-flow: row wrap;
		  		justify-content: center;
			}

	item property:
		order: <integer>         控制item的显示顺序，通过这个来实现显示顺序跟source order 不一样，值越小 order越前面，比如 -1 排在 0 前面
		align-self: auto | flex-start | flex-end | center | baseline | stretch;
			has same value as align-items, and override align-items. 所以这个值作用的是cross axis

		flew-grow: <number> ; /* default 0 */     当container有多余的space，决定该item要占据多少比例的space
		flex-shrink: <number>;/* default 1 */
		flex-basis: <length> | auto; /* default auto */
		flex: shortand flew-grow, flew-shrink, flex-basic, recommended to use shorthand property.  建议用这个属性，不单独用上面那3个
			  default 0,1,auto. second and third parameter is optional.

			ex.  
				<div class='container'>
					<div class="MainContent"> </div>
				 	<div class="Footer"> </div>
				</div>
				
				不管MainContent的内容有多少，始终要让Footer的都在最低端，可以通过如果设置来实现

				.container {display: flex, flex-direction: column, min-height: 100%;}
				.MainContent{flex: 1} // 设置flex-grow为1，由于container min-height是100%，footer因为没有设置flex-grow，所以MainContent会拥有所有
				的spacing，从而把footer挤到最下面去。


n+1: responsive images (https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
						https://www.sitepoint.com/how-to-build-responsive-images-with-srcset/
	
	
	1. use srcset attribute；Same size, different resolutions

		ex. <img src="scones_small.jpg" srcset="scones_medium.jpg 1.5x, scones_large.jpg 2x" alt="Scones taste amazing">

			x：used to define the device-pixel ratio. 2x 就是2倍 device-pixel ratio, 也就是1个device pixel等于2个css pixel

			there is an issue here; a device with a 1440px wide, 1x screen will get the same image as a 480px wide, 3x screen. That may or may not be the desired effect.

	2. use srcset and sizes attribute：Different sizes

		用来解决不同width的device上，看到的图片内容是一样大的问题。所以要提供不同size的image, 由browser根据device width选择对应image

		ex. <img srcset="elva-fairy-320w.jpg 320w, elva-fairy-480w.jpg 480w, elva-fairy-800w.jpg 800w" 
				 sizes="(max-width: 320px) 280px, (max-width: 480px) 440px, 800px" src="elva-fairy-800w.jpg" alt="Elva dressed as a fairy">

			srcset: specify how many resource image to use, and what inherent width image is
			sizes: 列出多个 media query 以及每个 media query 最合适的slot size, 根据这个 slot size 去srcset中匹配closest size的image
				   browser按顺序匹配media query，当某个media query符号条件，后面的media query就会被ignore，所以要注意media query的书写顺序
				   最后一个800px，前面没有media query，就是一个fallback，当没有任何media query 符号，就采用这个

	srcset 和 sizes 适合 Resolution switching 


	3. picture element: IE doesn't support this new element.
		ex.
			<pictures>
				<source media="(min-width: 30em)" srcset="cake-table.jpg">
				<source media="(min-width: 60em)" srcset="cake-shop.jpg">
				<img src="scones.jpg" alt="One way or another, you WILL get cake.">
			</picture>

	pictures 适合 Art direction 
