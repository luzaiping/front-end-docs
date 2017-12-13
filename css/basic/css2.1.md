1、pseudo-classes
	
	a、E:first-child: 匹配元素E，E必须是父元素下的第一个子元素，可以匹配多个结果

		如 li:first-child，匹配li元素，li必须是父元素(通常是ul)下的第一个子元素

	b、E:link 和 E:visited: 
		只对有href属性的元素起作用，通常是a。
		:link 是匹配未访问的a元素，即a元素最初始的状态，浏览器默认会有这个信息
	   	:visited 容易理解，就是已经被访问过的a元素

	c、E:active  E:hover  E:focus: 
		:active  
		:hover 鼠标悬停在上面时
		:focus 获得焦点时，键盘通过tab来触发，鼠标通过点击来触发
		在chrome tools，styles不会出现这几个的定义，只能通过source查看css文件

		LVHA order
		a:hover 必须定义在 a:link 和 a:visited 后面
		a:active 必须定于在 a:hover 后面

	new selector in css3
		:target, :enabled, :disabled, :checked, :root, :nth-child(), :nth-last-child() and so on.

2、pseudo-elements

	:first-line   only apply block element
	:first-letter
	:before :after  通常和 content一起，然后设置clear，从而实现float后parent的height被collapse，:before可以跟vertial-align结合使用

	in css3, using :: prefix to differ with pseudo-class

	ex. ::first-line, ::first-letter, ::before, ::after

3、inheritance: 表现在父子级上
	
	参考css的属性表格，看下哪些默认是继承，哪些不继承
	inherit  强制某个属性要继承。

4、cascade: 当同一个element出现多个匹配样式，决定最终要用哪个；跟下面3个有关

	importance >  specificity  >  source order
	
	cascade order: 
		user-agent < user normal declaration < author normal declaration < author !important < user !important

	specificity:

		tag selector/pseudo element < other attribute selector/pseudo class < id attribute < inline style

	@import 前面只能有 @charset，不可以有其他styles

5、 Media queries:

	At-Rules:  @import, @media

	Media queries consist of an optional media type and can, as of the CSS3 specification, contain zero or more expressions

	and, comma-list(or), not(这个是最后应用到表达式里), only

		@media not all and (monochrome) { ... }
		等同于
		@media not (all and (monochrome)) { ... }


	media 3种指定方式：
		
		1、html link 标签：

			<link ref="stylesheet" type="text/css" media="print, handheld" href="xxx.css">
			如果当前media不匹配指定的media type，该css也一样会被download，不过会在页面加载完成后，再download，也就是deferred 的加载方式

		2、@import

			@import xxx.css srceen (@import 导入css文件，会增加 http 请求，所以要谨慎使用这种方式)

		3、css 样式表里直接指定

			@media screen (max-width: 600px) {
				.facet_sidebar {
					display: none;
				}
			}

		@media tv and (min-width: 700px) and (orientation: landscape) { ...  }
			
	block statement 里面不可以再有 任何@，如 @media  @import 等

6、box model

	background influnce content area, padding, border. margin is always transparent, parent's background will show on it.

	vertical margins will not have any effect on non-replaced inline elements

	padding's value can not be negative.

	don't margin-collapse case:

		a. floated element
		b. BFC element
		c. absolute element
		d. inline-block element

7、Block-level elements and Block boxes

	block-level elements generates block-level boxes that contains contents and descendant box. block-level box 会参与BFC

	Except for table boxes and replaced elements, a block-level box is also a block container box.

	block container includes block-level box and inline-level box(non-replaced inline-block and non-replaced table-cell)

	native inline-block element:
		input(not matter what type is), select, textarea, button

7、Block formatting contexts

	float elements
	absolutely positioned elements
	block containers that are not block boxes (such as inline-block, table-cell, table-caption)
	block boxes with overflow other than visible

	above case establish new block formatting contexts for their contents.

8、z-index

	z-index only works on positioned elements such absolute, relative, fixed

	three ways to create new stack context:

	When an element is the root element of a document (the <html> element)
	When an element has a position value other than static and a z-index value other than auto
	When an element has an opacity value less than 1

	stack order:

	positioned & positive z-index > positioned & z-index=0 > inline-level > float > block > positioned & negative z-index

9、float
	
	1. Floated elements are pushed to the edge of their containers, no further.
	2. Any floated element will either appear next to or below a previous floated element. If the elements are floated left, the second element will appear to the right of the first. If they’re floated right, the second element will appear to the left of the first.
	3. A left-floating box can’t be further right than a right-floating box.
	4.Floated elements can’t go higher than their container’s top edge (this gets more complicated when collapsing margins are involved, see original rule).
	5. A floated element can’t be higher than a previous block level or floated element.
	6. A floated element can’t be higher than a previous line of inline elements.
	7. One floated element next to another floated element can’t stick out past the edge of its container.
	8. A floating box must be placed as high as possible. (No translation necessary)
	9. A left-floating box must be put as far to the left as possible, a right-floating box as far to the right as possible. A higher position is preferred over one that is further to the left/right. (No translation necessary)

10、vertical-align  line-height
	
	a、vertical-align 用在 inline or inline-block ，inline-table才有用，以下内容跟inline-table无关
	
	1. inline element
		baseline：is the line, the characters are sitting on (写一个x字母，字母最底下边缘就是inline element的baseline)
		outer edge(top/bottom)：align themselves with the top and bottom edge of its line height(跟line-height有关, line-height跟font-size有关)

	2. inline-block element
		baseline:
			overflow是hidden 或者 height不为空而内容为空， bottom edge of maring-box 就是 baseline
			in-flow content 的情况，baseline 是 last content element in normal flow（最后一行内容的baseline就是inline-block的baseline）
		outer edge: top and bottom edge of margin-box

	3. line-box
		baseline: 写一个字母x，字母最底下边缘就是line box的baseline
		text box：its height is equal to the font-size of its parent element. around its baseline, moves when baseline moves
		line box:  this is the area in which vertical alignment takes place.


	b、line-height 用在所有element上 表示2行文字的距离 (上行文字的底部和下行文字的底部距离)

	1. block element：把这个值设置成跟height一样大，可以让单行文字vertaical center.
	2. inline element: 这个值会影响 inline element 的 outer edge. 


11、word-wrap、 word-break 、text-overflow、white-space、overflow

	word-wrap: 用来指定是否允许对overflow的长单词进行断词换行. 换行是一定会的；断词只有当container不足于单独容纳长单词才会发生。所有浏览器都支持. css3用 overflow-wrap 来替代，还没有所有浏览器都支持，暂时不能用.
 		ex. word-wrap: break-word

 	word-break：这个比较暴力，只要到了边界处不足于容纳一个完整单词，就把最后的单词进行断词，当前行能容纳多少字母就都容纳，不能容纳的就换到下一行。也可以用来处理CJK(中文 日文 韩文，)。
 		ex. word-break: break-all

 	white-space: 对空格，tab，换行符的处理

 		normal: collapse space,tab and new lines 、break lines to fit line box.
 		pre：not collapse space,tab and new linews，not break lines. 等同于html的pre标签(honors white space and breaks)
 			
 			ex. <div>
 					This is pre text.
 				</div>
 				上面这段内容前后各有一个换行，This单词前还有空格
 				<div>This is pre text.</div>
 				上面这段内容没有换行也没有前后空格

 		pre-wrap: not collapse space,tab and new linews ，break lines to fit line box
 		
 		nowrap: collapse space,tabs and new lines，but not break lines.
 		pre-line: collapse space and tabs, but not new lines, break lines to fit line box.

 	text-overflow：需结合 overflow:hidden 才会有视觉效果. 当超出部分设置成hidden，不同text-overflow会有不同显示效果

 		text-overflow: ellipsis/clip/string


 	overflow: 

 		

 		对应的div 一定要设置height属性, 如果height不是固定值，则要保证所有父元素都要设定相应的height值，通常父元素就是 100%, 当前元素可以结合 calc(100% - XXX.px) 来设置


12、horizontal center & vertically center
	
	// horizontal center
	a. for inline and inline-block element

		{
			text-align: 'center'; // set this within a block level parent element(including ancestor)
		}

	b. for block element

		{
			margin: 0 auto; // auto for right and left margin equal some distance offset left and right
			width: percentant; // set this value to obvious visual
		}

	c. mutiple block element

		method 1: make block element to inline-block first, then set 'text-align' as inline-block element

			{
				text-align: center
			}
			{
				display: inline-block;
				/* must set max-width or width for aligned element*/
				max-width: value;
				width: value;
			}

		this method suit for mutiple elements stack on top of each other.

		method 2: using flex display

			{
				display: flex;
				justify-content: center;
			}

13. vertically central

	a. inline or inline-level content on single line（让inline 或 inline-block里的单行内容垂直居中）

		method 1. container 高度固定，设置container的line-height等于height
			{
				height: 100px;
				line-height: 100px;
			}

	b. inline or inline-level contents on multiple lines（让inline 或 inline-block里的多行内容垂直居中）

		method 1. 通过 table 和 table-cell 实现

			table-cell默认就是 vertical-align，table用法比较落伍，一般不用^_^

		method 2. 通过 display flex 来实现
			{
				display: flex;
			  	flex-direction: column;
			  	justify-content: center;
			}

		method 3. ghost content vertical align middle，要求parent的height不是auto，即是具体数值
			for ghost content:
			{
				content: '',
				display: inline-block; // 必须是 inline-block
				height: 100%; // 这个必须设置
				vertical-align: middle;
			}
			for centered content:
			{
				display: inline-block;
				vertical-align: middle;
			}

		method1,method3  无需知道parent 和 centered 的 宽和高，而且宽和高可以是任意，centered不能设置具体高度值

	=======================  上面2个是关于 inline or inline-block 里的内容居中  ======================================
	==================================================================================================================
	c. known height of block-level element（让高度已知的block element垂直居中，不是让里面的text居中）
		.parent {
		  position: relative;
		  height: 150px; // parent height 必须得设置
		}
		.centered {
		  position: absolute;
		  top: 50%;
		  height: 100px;
		  margin-top: -50px; /* account for padding and border if not using box-sizing: border-box; */
		}

	d. unknown height of block-level element（让高度未知的block element垂直居中，不是让里面的text居中）

		method 1. 用 transform
		.parent {
		  position: relative;
		}
		.child {
		  position: absolute;
		  top: 50%; // 位置往下50%，
		  transform: translateY(-50%); // 垂直位置往上element的一半高度，这样element就垂直居中了
		}

		method 2. 用flexbox
		.parent {
		  	display: flex;
		  	flex-direction: column;
		  	justify-content: center;
		}

	这些方法都是让block box居中，里面的内容如果要垂直居中，还需另外处理

	=======================  上面3个是关于 block 居中  ======================================
	==================================================================================================================

	同时垂直和水平居中，参考 block 的方法，增加对水平居中的处理就可以了

14. inline-block 空白符解决办法：

	1. 标签处理：

		<li>
		   one</li><li>
		   two</li><li>
		   three</li>

		 <li>one</li
		  ><li>two</li
		  ><li>three</li>

		  <li>one</li><!--
		  --><li>two</li><!--
		  --><li>three</li>

		  或者合并在一行

	2. Negative margin

	3. Skip the closing tag

	  <li>one
	  <li>two
	  <li>three

	4. Set the font size to zero on parent

	5. float

	6. flex box

	7. word-spacing on parent

15. layout总结

16. reset css

17. width & max-width & min-height, height & max-heigth & min-height


18. value

	initial value:

		就是 css property 的默认值。根据

	computed value:

	resolved

	specified value:

	used

	actual