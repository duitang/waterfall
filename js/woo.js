/*
@说明：瀑布流 Woo (Waterfall O O)
*/


;(function(window, undefined){


	var location = window.location,
		$W = $(window),
		// window窗口的高度，在初始方法中获得
		WH,
		// window窗口的宽度，只在resize 开启的情况下有用，用于判断resize前后宽度是否变化
		WW,
		H = $.History,
		// 当前瀑布流在所有瀑布流中的序号
		IDX = 0,
		// 是否用户有点击进行翻页
		USERCLICK = false,
		// 是否有tab 切换的事件发生
		TABSW = false,
		BARSCROLL = false,
		// 是否正在返回顶部，$gotop 按键点击后返回页顶时设置其值为 true
		SCROLLINGTOTOP = false,
		TIMERINTERVAL,
		TIMERSCROLL,
		// 总容器
		$HOLDER,
		PAGINE = [],
		MASN = [],
		// $.Woo.WooTemp 对象
		WOOTEMP;


	
	var Woo = function(conf){
		Woo.init(conf);
	};

	$.extend(Woo,{
		dfConf : {
			// 每个请求对应的form 的id 前缀，和 arrform 标识数组结合。
			"formprefix" : '#woo-form-',

			// 组件框架选择符，依次为 总节点、tab切换触发器、tab切换容器、内容、内容翻页器、内容(与woo-pcont为同一节点，区别是已经masn过)
			"frame" : ['#woo-holder','.woo-swa','.woo-swb','.woo-pcont','.woo-pager','.woo-masned'],

			// 向前、向后的翻页按钮(区别于底部数字翻页器)
			"gopre" : null,
			"gonext" : null,
			// 回到顶部按钮
			"gotop" : null,

			// 页面的尾部，所有在瀑布流翻页器之下的均可视为footer
			"footer" : null,

			// 单元节点dom选择器
			"unit" : '.woo',

			// anchor 锚点名，回顶部会定位到该锚点处
			"anchor" : 'woo-anchor',
			// 相对于 name="woo-anchor" 锚记的垂直方向偏移，可解决顶部fixed nav遮盖问题
			"anchordiff" : 70,

			// 带 * 号的为特殊配置项
			// 同一页面不同瀑布流可通过在.woo-pcont节点上设置 data- 的形式覆盖全局配置
			// * 要插入到瀑布流左侧第一个位置或右侧第一个位置的节点
			"sink" : $(null),
			// * 左(右)边第一列占位区块高度。sinkheight 如果为正值才有效
			"sinkheight" : 0, 
			// * 是否在右侧 sink 嵌入外部区块，否则是在左侧嵌入，前提是 sinkheight 为正值
			"sinkright" : false,

			// * 每页的单元数
			"unitsnum" : 24,

			// * 每一大页子页数量
			"subpagenum" : 4,

			// scroll lock状态持续时间
			"scrollwait" : 100,

			// 距离底部多远提前开始加载
			"lbias" : 400,

			// 每次append插入dom的单元个数
			"appendnum" : 12,

			// (逐个添加)是否逐个添加单元节点
			"batchopen" : false,
			// (逐个添加) 每次插入节点的时间延迟，batchopen 开启后有效
			"batchdelay" : 6,
			// (逐个添加) 每次插入dom的节点数，batchopen 开启后有效
			"batchnum" : 2,




			// 当前页码前后显示的页码数
			"nearbypagenum" : 3,

			// ajax 请求是否缓存
			"ajaxcache" : false,

			// resize 为 false 则 window resize 时不重绘，否则会调用默认的 resize 方法
			"resize" : false,


			// scroll 过程中执行的方法
			"onScroll" : function (tp){
				// tp 为当前的scrolltop
			},

			// 每一大页加载完毕之后执行
			"onOnePageOver" : function (pg, $pager){
				// pg 为 Pagine 实例，$pager 为底部翻页容器
				// 可以使用 pg.hasNextUpperPage()  pg.isLastSub()

			},

			// 每次请求后都要执行的方法
			"requestAlways" : function (idx){
				// idx 表示当前瀑布流的序号
			}
		},

		/*
		@说明：switch切换配合瀑布流内容展示
		@参数：
		conf			- (Dic) 配置参数，将覆盖 dfconf
		---- 以下为隐藏参数 dfconf 里没有他们的默认值
		arrform			- (Arr) 特征值组成的数组，
							用途一：根据url上的hash 值判断当前聚焦项
							用途二：和woo-form- 前缀组成form表单id 
		arrsplit		- (Arr) 请求分页地址的后半截，前半截在form表单里
		arrmasnw		- (Arr) 瀑布流每一列的扩展宽度，包含列间隔
		arrmargin		- (Arr) 瀑布流列之间的间隔
		arrfmasnw		- (Arr) 第一列特殊宽度 默认等于arrmasnw
		*/
		init : function (conf){
			// 简化传参
			if( typeof conf.arrsplit === 'string' ){
				var tmpsplit = conf.arrsplit;
				conf.arrsplit = [];
			}
			if( typeof conf.arrmasnw === 'number' ){
				var tmpmasnw = conf.arrmasnw;
				conf.arrmasnw = [];
			}
			if( typeof conf.arrmargin === 'number' ){
				var tmpmargin = conf.arrmargin;
				conf.arrmargin = [];
			}
			if( typeof conf.arrfmasnw === 'number' ){
				var tmpfmasnw = conf.arrfmasnw;
				conf.arrfmasnw = [];
			}
			if( typeof conf.arrgap === 'number' ){
				var tmpgap = conf.arrgap;
				conf.arrgap = [];
			}
			for( var i=0; i<conf.arrform.length; i++ ){
				tmpsplit && conf.arrsplit.push(tmpsplit),
				tmpmasnw && conf.arrmasnw.push(tmpmasnw),
				tmpmargin && conf.arrmargin.push(tmpmargin),
				tmpfmasnw && conf.arrfmasnw.push(tmpfmasnw);
				tmpgap && conf.arrgap.push(tmpgap);
			}
			// 参数处理结束

			// 配置初始化
			this.conf = $.extend({},this.dfConf,conf);



			var conf = this.conf,
				frame = conf.frame,
				$trigs = $(frame[1]),
				$conts = $(frame[2]),
				undefined;


			this.$holder = $HOLDER = $(frame[0]);


			// 如果没有相应dom，则返回
			if( !$HOLDER.length || !$trigs.length || !$conts.length ) return;

			// 初始化 $gonext $gopre $gopre $footer
			this.$conts = $conts,
			this.$gonext = $(conf.gonext),
			this.$gopre = $(conf.gopre),
			this.$gotop = $(conf.gotop),
			this.$footer = $(conf.footer);


			// WooTemp 对象
			WOOTEMP = Woo.WooTemp;

			// 计算window 的高度
			WH = $W.height();

			// webkit 内核判断
			this.iswebkit = $.browser && $.browser.webkit || !!/webkit/.exec(navigator.userAgent.toLocaleLowerCase())


			if( H && !H.getHash()){
				Woo._switch($trigs,$conts)
			}

			// 通过hash 值定位到
			H && H.bind(function(hash){
				// 是否tab 切换动作引发的 hashchange
				if( !TABSW ){
					Woo._switch($trigs,$conts)
				}else{
					TABSW = false;
				}

				// 从hash 中取得当前的大页码数，hash以 -p 分割为两部分
				var tmphash = hash.split('-p'),
					num = parseInt(tmphash[1]) || 1;
				// 当满足条件出现上翻页
				if( num > 1 ){
					Woo.$gopre.css("display","block")
				}else{
					Woo.$gopre.css("display","none")
				}

			});



			this.setClickGoPre(),
			this.setClickGoNext(),
			this.setClickGoTop();


			// 处理 window scroll 事件
			$W.scroll(function (){
				BARSCROLL = true
				window.clearTimeout(TIMERSCROLL)
				TIMERSCROLL = window.setTimeout(function (){
					BARSCROLL = false
				},Woo.conf.scrollwait)


				var tp = $W.scrollTop()
				Woo.$gotop.css('visibility',tp > 100 ? 'visible' : 'hidden')
			})


			// 处理 window resize 事件，重新计算window 高度
			$W.bind('resize',function (e){
				Woo.throttle(function (){
					WH = $W.height();

					// 是否执行 resize 方法由 conf.resize 决定
					if( conf.resize && WW != (WW=$W.width()) ){
						Woo.resize();
					}
				}, 100);
			})
		},



		iswebkit : null,



		// 相关dom 节点
		$holder : $(null),



		// masn子类实例数组
		masn : [],
		// pagine子类实例数组
		pagine : [],

		/*
		@说明：整列重新调整
		@参数：
		v				- (Num) 增加的高度
		sc				- (Num) 所在屏数
		co				- (Num) 所在列数
		tp				- (Num) top 值
		*/
		resetCol : function(v,sc,co,tp){
			var $masn = $HOLDER.find(this.conf.frame[5]+':visible').not('.woo-tmpmasn'),
				dacol = $masn.data('colY');

			if( dacol && dacol[co] ){
				dacol[co] += v;
				var mx = Math.max.apply(Math,dacol);

				// 重新设置高度，将新的 colY 保存到data 数据中
				$masn.data('colY',dacol).css({"height":mx})


				$HOLDER.find('div.co'+co).each(function (i,e){
					var ttp = parseInt(e.style.top);
					if( ttp > tp  ){
						e.style.top = (ttp + v) + 'px';
					}
				})
			}
		},

		/*
		@说明：节流控制函数，应用与窗口resize 
		*/
		throttle : function(method, delay){
			window.clearTimeout(Woo.throttle.timer);
			Woo.throttle.timer = setTimeout(function(){
				method.call(this);
			},delay);
		},

		/*
		@说明：窗口resize 时重绘
		*/
		resize : function (){
			// 重置所有MASN 的dom width
			for( var i=0; i<MASN.length; i++ ){
				var msni = MASN[i]
				if( i === IDX && msni ){
					msni.setCols(),
					// 重绘当前瀑布流， IDX 为全局变量保存当前瀑布流的序号
					msni.figure(),
					// true 表示一次性排列所有预置单元
					msni.arrangeContents(true);
				}else if( msni ){
					msni.resetDomWidth();
				}
			}
		},

		/*
		@说明：分批依次处理数组数据
		@参数：
		fn				- (Fun) 每次递归执行的方法
		arr				- (Arr) 供fn方法使用的参数，数组  fn方法必须返回一个数组
		n				- (Num) 递归的次数
		delay			- (Num) 递归延迟时间
		callback		- (Fun) 递归结束后执行的方法
		*/
		recurseDo : function(fn,arr,n,delay,callback){
			if( n == 0 ){
				if( $.isFunction(callback) ){
					callback();
				}
				return;
			}

			// fn 必须返回一个数组
			arr = fn.apply(null,arr);
			if( arr[0].length ){
				window.setTimeout(function (){
					Woo.recurseDo(fn,arr,--n,delay,callback);
				},delay)
			}else{
				if( $.isFunction(callback) ){
					callback();
				}
			}
		},


		/*
		@说明：获取form 的action 并做encode 操作
		*/
		getFormAction : function ($form){
			return encodeURI($form.attr('action'));
		},

		/*
		@说明：form 表单序列化为字符串
		@参数：
		$form			- (Obj) form 对象
		ajsn			- (Dic) 额外添加的json object 连接成字符串
		@返回值			- (Str) 表单数据序列化后生成的字符串
		*/
		paramForm : function ($form, ajsn){
			var jsn = {};

			$('input,select,textarea',$form)
			.not('[type=submit]')
			.filter('[name]')
			.each(function (i,a){
				if( ($(a).attr('type') === 'checkbox' || $(a).attr('type') === 'radio') &&  $(a).prop('checked') === true || ($(a).attr('type') !== 'checkbox' && $(a).attr('type') !== 'radio') ){
					if( jsn[a.name] !== undefined ){
						jsn[a.name] += ',' + a.value
					}else{
						jsn[a.name] = a.value;
					}
				}
			});
			if( $.isPlainObject(ajsn) ){
				$.extend(jsn,ajsn)
			};
			return $.param(jsn);
		},

		/*
		@说明：设置 gotop 键返回页顶的click 事件
		*/
		setClickGoTop : function (){
			Woo.$gotop.click(function (e){
				e.preventDefault(),
				e.stopPropagation();

				SCROLLINGTOTOP = true;

				// 这里的this 是点击事件触发节点即 $gotop 按钮
				var gotop = this,
					// webkit 内核浏览器使用 body 做 scroll 功能 
					// 非webkit 浏览器使用 html 做 scroll 功能
					$body = Woo.iswebkit ? $('body') : $('html');

				$body.animate({scrollTop:0},200,function (){
					gotop.style.visibility = 'hidden',
					SCROLLINGTOTOP = false;
				})
			})
		},



		/*
		@说明：设置 gopre 键向前翻一页的click 事件
		*/
		setClickGoPre : function (){
			Woo.$gopre.click(function (e){
				e.preventDefault();
				Woo._clickGo.call(this,-1)
			})
		},



		
		/*
		@说明：设置 gonext 键向后翻一页的click 事件
		*/
		setClickGoNext : function (){
			Woo.$gonext.click(function (e){
				e.preventDefault();
				Woo._clickGo.call(this,1)
			})
		},


		/*
		@说明：内部方法，供 setClickGoPre setClickGoNext 中设置的 click事件调用
		@参数：
		dir				- (num) 取值只能 1 或 -1  分别表示向前和向后
		*/
		_clickGo : function (dir){
			var conf = Woo.conf;

			// 这里的this 指代点击事件触发节点
			$(this).css('display','none');
			if( PAGINE && PAGINE[IDX] && MASN && MASN[IDX]){
				var $pagerv = $HOLDER.find(conf.frame[4]+':visible'),
					cond1 = $pagerv.find('.woo-pbr').length,
					cond2 = PAGINE[IDX] && PAGINE[IDX].hasNextUpperPage,
					f = cond1 && cond2 ? false : true;

				// 如果upper page 只有1页
				if( cond1 && !cond2 ){
					return
				}

				PAGINE[IDX].isPagerClick = true;

				//如果翻页器没有出现，即中途强制翻页
				if( f ){
					PAGINE[IDX].loading = false;
					PAGINE[IDX].lazyAdding = true;
					PAGINE[IDX].halting = true;
				}
				PAGINE[IDX].slidePage(dir,true)
			}
		},


		/*
		@说明：内部方法，switch 触发按键的事件绑定
		@参数：
		$trigs			- (obj) 切换触发节点
		$conts			- (obj) 主内容节点，和$trigs 配对
		*/
		_switch : function($trigs,$conts){
			var conf = Woo.conf,
				// 框架各层次dom选择器
				frame = conf.frame,
				// 标识字符串数组
				arrform = conf.arrform;

			// 使用tabswitch 组件
			// a 表示当前序号 pre 表示前一个序号 c 表示是点击或自动播放触发的tabswitch
			$trigs.tabswitch(function ($l,$c,a,pre,c){ 

				var $ndym = $l.eq(a),
					// 每次切换都重置到第1大页
					upg = 1;


				// 如果是swtich 组件第一次初始化
				if(!c){
					//
				}else{
					// 为了避免在loading 过程中hash change 导致的无法准确回退。借用 $W 保存状态
					USERCLICK = true;

					// tab 切换事件发生
					TABSW = true;

					if( H ){
						var nexh = '!' + arrform[a];
						H.setHash(nexh + ( upg > 1 ? '-p'+upg : ''));
					}
				}

				// 清除内存 WooTemp 对象，主要是MASNUNITS
				WOOTEMP.reset();

				// 清除上一次瀑布流的缓存数据
				if( PAGINE[pre] ){
					PAGINE[pre].idata = []
					PAGINE[pre].$data = $(null)
				}
				Woo._pageInit($conts,a,upg);
			},{"focus":"woo-cur","cont":frame[2],"index":Woo._getFocusIdx($trigs)});
		},


		/*
		@说明：内部方法，获取当前tab 的index 序号数
		@参数：
		$conts			- (Obj) 主内容节点
		n				- (Num) 每个切换所对应的序号数
		gtoupg			- (Num) 当前的大页码数
		*/
		_pageInit : function($conts,n,gtoupg){
			IDX = n;

			var conf = this.conf,
				frame = conf.frame,
				arrform = conf.arrform,
				arrsplit = conf.arrsplit,
				arrmasnw = conf.arrmasnw,
				arrmargin = conf.arrmargin,
				arrfmasnw = conf.arrfmasnw,
				arrgap = conf.arrgap,
				splitstr =  arrsplit[n] || '',
				$ccont = $conts.eq(n),
				$pg_cont = $ccont.find(frame[3]).not('.woo-tmpmasn'),
				$pg_pager = $ccont.find(frame[4]),
				// 各自.woo-pcont节点上设置 data-totalunits 总单元数
				// 如不设置，翻页器将采用hasnext 模式
				ucount = parseInt($pg_cont.data('totalunits')),
				pageunknown = isNaN(ucount),
				// np 代表瀑布流单元块形态，取值为数字 0,1,2... 
				// 对应 masnunit.js 文件里的种种
				np = $pg_cont.data('wootemp') || 0,
				// conf 里配置的 subpagenum 为全局配置
				// 不同瀑布流可能有不同的配置需求，可在各自.woo-pcont节点上设置 data-subpagenum
				subpagenum = $pg_cont.data('subpagenum') || conf.subpagenum,
				// conf 里配置的 unitsnum 为全局配置
				// 不同瀑布流可能有不同的配置需求，可在各自.woo-pcont节点上设置 data-unitsnum
				unitsnum = $pg_cont.data('unitsnum') || conf.unitsnum,
				sink = $pg_cont.data('sink') ? $($pg_cont.data('sink')) : $(conf.sink),
				sinkheight = $pg_cont.data('sinkheight') || conf.sinkheight,
				sinkright = !!$pg_cont.data('sinkright') || conf.sinkright,


				// 总子页码数
				pcount = pageunknown ? 2 : Math.ceil(ucount/unitsnum),

				// 是否要扩展第一列，意思是与其它列的宽度不一样
				isextended = !!arrfmasnw[n],

				// masn 每列宽度
				wdt = arrmasnw[n];
				// 列与列之间的间隔
				mgn = arrmargin[n],
				// 同一列间单元块之间的垂直间隔
				gap = arrgap[n],
				// 是否支持扩展列，扩展列的宽度
				fwdt = isextended ? wdt+arrfmasnw[n] : wdt,
				// 是否采用 nextMode 模式
				hsn = pcount > 2 ? false : true,
				undefined;


			// 总共只有1个子页不隐藏 footer，否则隐藏之
			this.$footer.css("display", pcount == 1 ? "block" : "none");

			if( !PAGINE[n] ){
				var pgcache,
					$pgdata = $(null);

				this.masn[n] = MASN[n] = new Woo.Masn($pg_cont,{
					unit : conf.unit,
					gap : gap || 0,
					onAppend : Woo._doLoadImage,
					onArrange : function ($c){
						if( $c.length ){
							pgcache = 2;
							$pgdata = $c;
						}

						if( PAGINE[n] ){

							PAGINE[n].caching = 1;
							PAGINE[n].$data = $c;
						}

						// _onscroll 总控
						if( TIMERINTERVAL ){
							window.clearTimeout(TIMERINTERVAL)
						}
						Woo._onscroll()
					},
					initAppendCounts : unitsnum,
					sinkWhat : sink,
					firstHeight : sinkheight,
					rightAlignFirstBlock : sinkright,
					firstColumnWidth : fwdt,
					columnWidth : wdt,
					columnMargin : mgn,
					batchOpen : conf.batchopen,
					batchDelay : conf.batchdelay,
					batchNum : conf.batchnum
				})

				this.pagine[n] = PAGINE[n] = new Woo.Pagine([$pg_cont,$pg_pager],{
					identity : '!' + arrform[n],

					// 请求拆解后的数组，分解为3个元素
					arrRequestUrl : [$(conf.formprefix+arrform[n])[0],splitstr],

					// 请求分页数据，请求结束后 always 执行
					requestAlways : conf.requestAlways,

					onOnePageOver : conf.onOnePageOver,

					// ajax 请求是否缓存
					ajaxcache : conf.ajaxcache,
					
					// 触发下翻页的scroll 偏离值，例如提前100px触发
					scrollBias : conf.lbias,


					// 翻页按钮点击后的 锚点定位
					anchor : conf.anchor,
					// 相对于 name="woo-anchor" 锚记的垂直方向偏移，可解决顶部fixed nav遮盖问题
					anchorDiff : conf.anchordiff,

					// 当前页码前后显示的页码数
					nearbyPageNum : conf.nearbypagenum,

					// 每一大页子页数量
					subPageNum : subpagenum,
					// 每页的单元数
					unitsPerSub : unitsnum,




					// 当前大页码数
					currentUpperPage : gtoupg,

					// 总子页码数
					totalPageNum : pcount,

					caching : pgcache,

					// masn 第一页装入的unit dom
					$data : $pgdata,
					// 是否采用 hasNext 模式
					nextMode : hsn,

					// 获取数据之前执行的方法
					beforeRequest : function (c){
						var $loadingsm = $('#woo-loading')

						if( !$loadingsm.length ){
							$loadingsm = $('<div id="woo-loading" class="woo-loading"></div>').appendTo('body')
						}


						Woo.$footer.css("display","none")

						// 如果主内容区块有被清空
						if(c){
							// 内容区域loading 进度条展示
							$pg_cont.addClass('woo-loading'),

							$loadingsm.css('visibility','hidden'),

							// 清除内存 WooTemp 对象，主要是MASNUNITS
							WOOTEMP.reset();

							// 清除上一次瀑布流的缓存数据
							if( PAGINE[n] ){
								PAGINE[n].idata = []
								PAGINE[n].$data = $(null)
							}

							// 重新开启 TIMERINTERVAL
							if( TIMERINTERVAL ){
								window.clearTimeout(TIMERINTERVAL)
							}

							Woo._onscroll()
						}else{
							$loadingsm.css('visibility','visible')
						}
					},
					analyzeResponse : WOOTEMP.analyzeResponse[np],


					// 分解小块加载
					lazyAdd : function (emp){
						var pg = this,
							c = pg.config;

						// 如果没有数据直接返回
						if( pg.$data.length === 0 && pg.idata.length === 0 ){
							pg.caching = 0;

							// 如果到达最后，则显示footer
							if( pg.isLastSub() ){
								pg.showFooter();
							}

							return;
						}

						pg.lazyAdding = true,
						pg.caching = 1;


						var $da = pg.$data,
							ida = pg.idata,
							len1 = $da && $da.length || 0,
							len2 = ida && ida.length || 0,
							tlen = len1 + len2,
							// Math.max(MASN[n].spaceNum(),6), 计算合适的填充数
							snum = emp ? Math.max(tlen + 1,c.unitsPerSub) : Woo.conf.appendnum,
							rnum = len1 + len2 - snum,
							addfirst = false;



						if( emp && MASN[n] ){
							MASN[n].clearColY(),
							addfirst = true;
						}

						var $madd,
							imadd;
						if( snum <= len1 ){
							// 全部使用$da 里的数据
							$madd = $da.slice(0,snum),
							pg.$data = $da.slice(snum);
						}else{
							$madd = $da,
							pg.$data = $(null),
							imadd = ida.slice(0,snum-len1),
							pg.idata = ida.slice(snum-len1);
						}


						// Start = new Date().getTime()
						// 这里生成的jonhtml 可能是 string 类型
						// 也可能是 [<jQuery对象>] 数组
						// 这两种情况均需要 $() 后再使用
						var jonhtml = WOOTEMP.render[np] ? WOOTEMP.render[np](imadd) : imadd;
						MASN[n].appendContents($madd,jonhtml,false,false,addfirst,Woo.conf.batchnum,function (lastscreen,screen){

						// End = new Date().getTime()
						// console.log(End - Start)

							if( rnum <= 0 ){
								// pg 指代 Pagine 对象实例
								pg.caching = 0;
								var cp = pg.currentPage,
									spn = c.subPageNum;


								// 预加载第二页
								if( cp % spn === 0  && pg.currentPage != pg.totalPageNum ){
									window.setTimeout(function (){
										pg.prepareNext()
									},400)
								}

								// 如果到达最后，则显示footer
								if( pg.isLastSub() ){
									pg.showFooter()
								}
							}else{
								pg.caching = rnum <= c.unitsPerSub ? 1 : 2,
								// 设置翻页器不可见
								pg.$pager.css({"height" : 0,"overflow" : "hidden"});
							}

							window.setTimeout(function (){
								pg.lazyAdding = false;
							},200)

						},function ($u){
							var masn = this;
							// 设置大容器的高度
							emp && masn.setContHeight(),
							Woo._doLoadImage($u);
						});
					}
				});

			}else{

				// 使用 USERCLICK
				// 为了避免在loading 过程中hash change 导致的无法准确回退
				if( !PAGINE[n].lazyAdding && !PAGINE[n].loading || !USERCLICK ){
					PAGINE[n].lazyAdding = true,
					PAGINE[n].scrollLoading = true;

					MASN[n].setCols();
					// 第二次点击时重新取得数据，保证数据得到及时更新，默认刷新当前页
					PAGINE[n].refreshPage(gtoupg);
				}
			}
			// 为了避免在loading 过程中hash change 导致的无法准确回退
			USERCLICK = false,

			Woo.$gonext.css('visibility', 'hidden');
		},


		/*
		@说明：从hash值中获取当前页的标识字符串
		*/
		_getIdentityFromHash : function (){
			var u = location.hash.substr(1);
			u = u.split('-')[0];
			return u;
		},

		/*
		@说明：内部方法，获取当前tab triger 的序号数
		@参数：
		$trigs			- (obj) 切换触发节点
		*/
		_getFocusIdx : function($trigs){
			var arrform = Woo.conf.arrform,
				hs = Woo._getIdentityFromHash().substr(1),
				fcn = -1;

			for( var i=0; i<arrform.length; i++ ){
				if( arrform[i] === hs ){
					fcn = i;
					break;
				}
			}

			if(fcn === -1){
				$trigs.each(function (i,e){
					if($(e).hasClass('woo-cur')){
						fcn = i;
					}
				})
			}
			fcn = fcn === -1 ? 0 : fcn;

			return fcn;
		},



		/*
		@说明：scroll 相关
		*/
		_onscroll : function(){
			// 如果是正在回顶部的过程中，则不执行_onscroll
			if( !SCROLLINGTOTOP ){
				var tp = $W.scrollTop();
				// 如果已经确认scrollbar 拉到底部了
				if( PAGINE[IDX] && !PAGINE[IDX].lazyAdding && tp + WH > $('body').height() - Woo.conf.lbias ){
					// pageinate 绑定的scroll事件 第二个参数不再作scroll 高度判断直接进入
					PAGINE[IDX].doLazyAdd(tp,true),
					PAGINE[IDX].doLoadNext();
					//////////
				}

				// 如果滚动轴scrollbar 没有在滚动
				if( !BARSCROLL ){
					// 外部配置的onScroll 方法
					Woo.conf.onScroll(tp)

					if( $HOLDER.length ){
						var conf = Woo.conf,
							$gopre = Woo.$gopre,
							$gonext = Woo.$gonext,
							$pagerv = $HOLDER.find(conf.frame[4]+':visible'),
							cond1 = $pagerv.find('.woo-pbr').length,
							cond2 = PAGINE[IDX] && PAGINE[IDX].hasNextUpperPage;
						$gopre.add($gonext).css('visibility',tp > $HOLDER.position().top && ( !cond1 || cond1 && cond2 ) ? 'visible' : 'hidden')
					}
				}
			}

			window.clearTimeout(TIMERINTERVAL),
			TIMERINTERVAL = window.setTimeout(Woo._onscroll,100);
		},



		/*
		@说明：内部方法，添加节点时的并行方法，加载单元内的图片
		@参数：
		$u				- (obj) 单元节点
		*/
		_doLoadImage : function($u){
			// 设置了 srcd 的情况下
			$u.find('img[srcd]').each(function (i,e){
				var $e = $(e),
					or = $e.attr('srcd');

				//如果事先设置了 srcd 取代图片 src
				if( or ){
					$e.css("display","none")
					.one('load',function (){
						$(this).css({
							"visibility" : "visible"
						})
						.fadeIn(400)

					})
					// 当图片加载失败，捕获error 重新加载
					.one('error',function (){
						var $t = $(this)
						$({}).delay(1000).queue(function (){
							$t.one('error',function (){
								$t.attr('src',or)
							})
							.attr('src',or)
						})
					})
					.attr('src',or).removeAttr('srcd')
				}
			})
		}
	});



	/*
	@说明：Pagine 类
	*/
	Woo.Pagine = function (id,opts){
		this.init(id,opts);
	}

	Woo.Pagine.prototype = {
		/*
		@说明：pagine 类初始化方法
		@参数：
		id				- (Arr) 两部分容器。id[0]页面内容容器；id[1]翻页器
		opts			- (Dic) 配置参数，详见类实例化的相关代码
		*/
		init : function (id,opts){
			this.config = $.extend({}, opts);
			var pg=this,
				c = pg.config,
				upg = c.currentUpperPage,
				spn = c.subPageNum,
				undefined;

			pg.hasNextUpperPage = true,
			pg.caching = c.caching,
			pg.$data = c.$data || $(null),
			pg.idata = [],
			pg.$dom = id[0],
			pg.$pager = id[1],
			pg.unitsPerSub = c.unitsPerSub,
			pg.totalPageNum = c.totalPageNum,
			pg.currentUpperPage = upg,
			pg.currentPage = (upg-1)*spn + 1;

			// 如果分页内容为空，则自动发起请求
			if( !pg.$dom.find(':first-child').length ){
				// 此参数用于判断 是否清空cont 这里设为false 因为本来就是空
				pg.clearCont = false, 
				pg.loadPage(pg.currentPage, 1 );
			}else if( upg > 1 ){
				pg.clearCont = true,
				pg.loadPage(pg.currentPage, 1);
			}else{
				pg.setPager();
			}
		},
		/*
		@说明：装载当前页内容，包括两部分，内容置于contObj节点内；翻页器置于pager节点内
		@参数：
		cp				- (Num) 当前页码数
		sub				- (Bool) 加载subpage 中
		direct			- (Bool) 和 .halting 配合解决中途翻页的问题
		*/
		loadPage : function (cp,sub,direct){
			if(this.loading){
				this.scrollLoading = false;
				return;
			}
			var pg = this,
				c = pg.config,
				spn = c.subPageNum,
				isFirstSub = sub && ( cp % spn === 1 || spn == 1 ),
				clear = false,
				undefined;


			!sub && pg.scrollToAnchor(),

			pg.$pager.css("display","none"),
			pg.pagerVisible = false,
			pg.loading = true,
			// 分页页码重新计算，此段js 必须在 pg.currentPage = cp 之前
			pg.currentUpperPage = cp;

			if(spn > 1 && !sub){
				cp = (cp - 1) * spn + 1;
			}else if(spn > 1 && sub){
				pg.currentUpperPage = Math.floor((cp-.1)/spn) + 1;
			}


			if( (!sub || isFirstSub) && pg.clearCont ){
				//url hash定位 只在firstSub 时改变hash
				pg.changeHashOnFirstLoad(c.identity, pg.currentUpperPage);

				// 为了避免在loading 过程中hash change 导致的无法准确回退
				USERCLICK = true,
				clear = true,
				pg.$dom.empty();
			}

			// beforeRequest 方法执行
			c.beforeRequest.call(pg,clear),
			pg._requestData(cp,sub,direct);
		},

		/*
		@说明：平滑scroll 到指定锚点处
		*/
		scrollToAnchor : function (){
			var pg = this,
				c = pg.config,
				$body = Woo.iswebkit ? $('body') : $('html'),
				$tohsh = $('a[name='+c.anchor+']');

			// 分页内容容器置空，先置空内容再做 anchor 定位
			if( c.anchor && $tohsh.length ){
				// 此处由于导航设置fix 跟随，需要额外减去70 的高度
				var at = $tohsh.offset().top - c.anchorDiff || 0;
				if( $body.scrollTop() > at ){
					$body.animate({scrollTop:at},200);
				}
			}else{
				// 除了ie6 其它浏览器不要设置默认回顶部，会造成切换时页面跳动
				// 这里用到了 ActiveXObject 和 XMLHttpRequest 对象来区分 ie6
				if( !!window.ActiveXObject && !window.XMLHttpRequest ){
					$body.animate({scrollTop:0},200);
				}
			}
		},

		/*
		@说明：goto 到指定页码数
		@参数：
		cp         - (Num) 页码数
		*/
		gotoPage : function (cp){
			var pg = this;
			pg.clearCont = true,
			pg.loadPage(cp,false,true);
		},
		/*
		@说明：刷新指定upper page，没传值则刷新当前页面
		*/
		refreshPage : function (n){
			var pg = this,
				upg = n || pg.currentUpperPage;

			pg.$data = $(null),
			pg.idata = [],
			pg.caching = 0,
			pg.halting = true,
			pg.loading = false,
			pg.gotoPage(upg);
		},
		/*
		@说明：上下翻页，每次翻动一页，有方向性
		@参数：
		dir				- (Num) 当dir=1时，向下翻页页码数+1；当dir=-1时，向上翻页页码数-1
		direct			- (Bool) 和 .halting 配合解决中途翻页的问题
		*/
		slidePage : function (dir,direct){
			var pg = this,
				cp = pg.currentUpperPage;
			pg.clearCont = true,
			pg.loadPage(cp+dir,false,direct);
		},
		/*
		@说明：对应子页翻页
		@参数：
		dir				- (Num) 当dir=1时，向下翻页页码数+1；当dir=-1时，向上翻页页码数-1
		*/
		slideSubPage : function (dir){
			var pg = this,
				cp = pg.currentPage;

			pg.clearCont = true,
			pg.loadPage(cp+dir,1);
		},
		/*
		@说明：指定页码翻页，输入页码数
		*/
		jumpPage : function (){
			var pg = this,
				mypto = pg.$pager.find('[type=text]').val() || 0;
			if(mypto){
				pg.clearCont = true,
				pg.loadPage(mypto);
			}
		},
		/*
		@说明：预加载下一页的第一子页数据
		*/
		prepareNext : function (){
			var pg = this,
				cp = pg.currentPage;

			// 如果还没有prepare
			if( !pg.prepare || pg.prepare[0] !== cp+1 ){
				pg._requestData(cp+1,true,false,true)
			}
		},

		/*
		@说明：请求结束后马上执行，并处理请求到的 html 片段
		参数：
		*/
		requestOver : function (cp,sub,jsndata,hasnext,totalunit){
			var pg = this,
				c = pg.config,
				// 判断contObj 里的内容是否为空，即是否有过大翻页
				emp = !pg.$dom.find(':first-child').length,
				spn = c.subPageNum,
				isFirstSub = cp % spn === 1, //第一子页
				undefined;

			pg.hasNoMore = !hasnext,
			// currentPage 当前子页码数
			pg.currentPage = cp,
			pg.caching = 2;

			/***************** 原 afterRequest 内容 ****************/
			// totalunit 源自请求返回数据里的相应字段，建议每次请求都返回unit 总数
			// 如果有 totalunit 更新 pg.totalPageNum
			if( totalunit ){
				pg.totalPageNum = Math.ceil(totalunit/c.unitsPerSub)
			}

			// 如果是第一页 通过emp 判断
			if( emp ){
				//page loading 仍然在继续
				pg.loading = true;
			}
			var thn = c.nextMode,
				tcp = pg.currentPage,
				tup = pg.currentUpperPage || tcp,
				ttp = pg.totalPageNum,
				$loadingsm = $('#woo-loading'),
				undefined;

			// 主内容区块消除正在加载的标识
			pg.$dom.removeClass('woo-loading');

			// 如果已经是最后一个子页
			if( !pg.isLastSub() ){
				$loadingsm.css('visibility','hidden');
			}


			if( thn || tcp === ttp ){
				if( hasnext ){
					pg.totalPageNum = tcp + 1;
				}else{
					pg.totalPageNum = tcp;
				}
			}else if( !thn ){
				if( !hasnext ){
					pg.totalPageNum = tcp;
				}else if(tcp > ttp){
					pg.totalPageNum = tcp + 1;
				}
			}
			/***************** 原 afterRequest 内容结束 ****************/



			pg.idata = pg.idata.concat(jsndata);

			// 第二个参数容器内容为空，则全部添加到容器中
			c.lazyAdd.call(pg,emp);



			// 最后一页的判断必须放在 af.call 后面，因为af 有对totalPageNum进行修改
			// setPager 必须放在后面
			if(!sub || isFirstSub || pg.isLastSub()){
				pg.setPager();
			}

			if( pg.caching ){
				pg.$pager.css({
					"display" : "block",
					"height" : 0,
					"overflow" : "hidden"
				})
			}else if( pg.isLastSub() ){
				pg.$pager.css({
					"display" : "block",
					"height" : "auto"
				})
			}
			pg.pagerVisible = true;
		},

		// 请求分页数据，请求结束后 always 执行
		_requestAlways : function (){
			var pg = this,
				c = pg.config;
			pg.loading = false,
			pg.$dom.removeClass('woo-loading'),
			$('#woo-loading').css('visibility','hidden');

			// 执行配置好的 requestAlways 方法
			$.isFunction(c.requestAlways) && c.requestAlways(IDX);
		},

		/*
		@说明：获取分页数据
		@参数：
		cp				- (Num) 分页页码数
		sub				- (Bool) 加载subpage 中
		direct			- (Bool) 中断之前的请求处理，直接进入下一次请求
		prepare			- (Bool) 是否启动后一页预加载
		*/
		_requestData : function (cp,sub,direct,prepare){
			var pg = this,
				c = pg.config,
				spn = c.subPageNum,
				undefined;

			// 点此重试按钮去除
			$('#woo-retry').remove();

			// 大页码翻页时，检查有没有预加载
			if( pg.prepare && pg.prepare[0] == cp ){
				pg.requestOver(cp,sub,pg.prepare[1],pg.prepare[2],pg.prepare[3]),
				pg.prepare = null,
				// 延迟两秒后执行 always 以便设置 pg.loading=false
				$({}).delay(100).queue(function (){
					pg._requestAlways()
				}),
				pg.scrollLoading = false;
			}else{
				// 分析arrurl 即 c.arrRequestUrl 如果第一参数是form dom 则进行解析
				var arrurl = [].concat(c.arrRequestUrl);

				if( $.type(arrurl[0]) === 'object' && arrurl[0].tagName.toLowerCase() === 'form' ){
					var $form = $(arrurl[0]);
					arrurl[0] = Woo.getFormAction($form),
					arrurl[2] = Woo.paramForm($form);
				}

				$.ajax({
					type : 'GET',
					cache : typeof DEBUG !== 'undefined' && DEBUG ? false : !!c.ajaxcache,
					url : typeof DEBUG !== 'undefined' && DEBUG  ? '?page='+cp : arrurl[0] +  cp  + arrurl[1],
					data : arrurl[2],
					timeout : 20000,
					success : function(h){
						// 如果是 debug状态，随机取一页测试数据
						typeof DEBUG !== 'undefined' && DEBUG  && (h = DEBUG_DATA[Math.floor((DEBUG_DATA.length-1)*Math.random())]);

						if( pg.halting && !direct ) return;
						if( direct ){
							pg.halting = false,
							pg.$dom.empty();
						}

						// resp = [cont, hasnext, totalcount]
						// 前两个数值必须有，最后的totalcount 可选
						var resp =  c.analyzeResponse(h);


						if(prepare){
							pg.prepare = [cp,resp[0],resp[1],resp[2]];

							// 准备下一页的图片，预加载图片
							var lst = [];
							$(resp[0]).find('img[srcd]').each(function (i,e){
								var $e = $(e);
								lst.push($e.attr('srcd'));
							})

							Woo.recurseDo(function (a){
								new Image().src = a.splice(0,1);
								return [a];
							},[lst],lst.length,200)
						}else{
							pg.requestOver(cp,sub,resp[0],resp[1],resp[2]);
						}

						pg.scrollLoading = false;
						pg._requestAlways();
					},

					error : function (x,statustext){
						if(!prepare){
							$('<div id="woo-retry" style="text-align:center;padding:16px 0 0;height:48px">网络繁忙，<a href="javascript:;">点此重试~</a></div>')
							.click(function (e){
									e.stopPropagation(),
									e.preventDefault(),
									pg._requestData(cp,sub),
									$(this).remove();
								})
							.insertAfter(pg.$dom);
						}
						pg._requestAlways()
					}
				})
			}
		},

		/*
		@说明：是否还有下一大页
		*/
		hasNextUpperPage : function (){
			var pg = this;

			return pg.hasNextUpperPage;
		},

		/*
		@说明：是否是最后一个子页
		*/
		isLastSub : function (){
			var pg = this;

			return pg.currentPage % pg.config.subPageNum === 0 || pg.currentPage === pg.totalPageNum;
		},

		/*
		@说明：最后一个子页加载完后执行，显示footer 用
		*/
		showFooter : function (){
			var pg = this;

			pg.$pager.css({"height" : "auto"}),
			Woo.$footer.css("display","block"),
			// 移除底部的loading 状态条
			$('#woo-loading').remove();

			// 设置翻页器可见
			window.setTimeout(function (){
				// 结束intervaltimer
				if( pg.$data.length === 0 && pg.idata.length === 0 ){
					window.clearTimeout(TIMERINTERVAL)
				}
			},200);

			// call onOnePageOver
			pg.config.onOnePageOver(pg);
		},

		/*
		@说明：设置pager内容，依赖this.pager 节点
		*/
		setPager : function (){
			var pg = this,
				c = pg.config,
				cup = pg.currentUpperPage,
				nn = c.nearbyPageNum,
				tn = pg.totalPageNum,
				spn = c.subPageNum,
				// 翻页器字符串
				strPager = '',
				undefined;

			tn = Math.floor((tn-.1)/spn) + 1;

			if( c.nextMode && cup >= tn && pg.hasNoMore || !c.nextMode && cup >= tn ){
				pg.hasNextUpperPage = false;
			}

			if( pg.isLastSub() ){
				// 以下是配置普通翻页器的html 字符串
				strPager = ['<div class="woo-pbr"><ul class="woo-dib">',
						cup==1 ? '' : '<li><a class="woo-pre" href="javascript:;" pdir="-1" >上一页</a></li>' ,
						cup==1 ? '<li class="woo-cur">1</li>' : '<li><a href="javascript:;">1</a></li>',
						cup-nn > 2 ? '<li class="woo-ell" >…</li>' : '',
						(function (){
							var tmps = '';
							for(var i=cup-nn; i<=cup+nn; i++){
								if( i==cup && i!=1 ){
									tmps += '<li class="woo-cur">'+i+'</li>';
								}else if(i>1 && i<=tn){
									tmps += '<li><a href="javascript:;">'+i+'</a></li>';
								}
							}
							return tmps
						})(),
						cup+nn < tn-1 && !c.nextMode ? '<li class="woo-ell" >…</li>' : '',
						cup+nn < tn && !c.nextMode ? '<li><a href="javascript:;">'+tn+'</a></li>' : '',

						cup==tn ? '' : ( c.nextMode ? '<li class="woo-ell" >…</li>' : '') +'<li><a class="woo-nxt" href="javascript:;"  pdir="1">下一页</a></li>',
						'</ul></div>'].join('');


				pg.$pager.find('.woo-pbr').remove(),
				pg.$pager.append(strPager);
			}
			else{
				pg.$pager.find('.woo-pbr').remove(),
				pg.$pager.append(strPager);
			}


			// pager绑定click 事件
			if(!pg.isEventSetting){
				pg.addEventOnPagerClick(),
				pg.isEventSetting = true;
			}

			var $gonext = Woo.$gonext;
			$gonext.css('display','block');
			if( pg.$pager.find('.woo-pbr').length ){
				$gonext.css('visibility', pg.hasNextUpperPage ? 'visible' : 'hidden');
			}

			pg.pagerVisible = true,
			pg.doLazyAdd();
		},


		/*
		@说明：url hash定位 只在firstSub 时改变hash
		@参数：
		idt				- (Str) pagine 对象的标识字符串
		upg				- (Num) pagine 对象的 currentUpperpage
		*/
		changeHashOnFirstLoad : function (idt,upg){
			var hash = idt + (upg > 1 ? '-p' + upg : '');

			if( location.hash !== hash ){
				location.hash = hash;
			}
		},

		/*
		@说明：翻页pager 绑定click事件
		*/
		addEventOnPagerClick : function (){
			var pg = this;

			pg.$pager.click(function (e){
				e.stopPropagation(),
				e.preventDefault();
				
				var s = e.target;
				if( s && s.tagName && s.tagName.toLowerCase() != 'a'){
					s = $(s).closest('a')[0];
				}
				if( s && s.tagName && s.tagName.toLowerCase() === 'a' && !$(s.parentNode).attr('nolink')){
					var pto = parseInt(s.innerHTML),
						dir = s.getAttribute('pdir');

					if(pto){
						pg.gotoPage(pto);
					}else if(dir === 'jump'){
						pg.jumpPage();
					}else if(dir === 'sub'){
						pg.slideSubPage(1);
					}else if(dir = parseInt(dir)){
						pg.slidePage(dir);
					}
				}
			})
		},

		/*
		@说明：判断是否触发 lazyAdd 
		@参数
		wt				- 传入的 window scrollTop 数值
		imm				- 直接进入 lazyAdd
		*/
		doLazyAdd : function (wt,imm){
			var pg = this,
				c = pg.config,
				wt = wt === undefined ? $W.scrollTop() : wt,
				dacol = pg.$dom.data('colY'),
				distance = pg.$pager.offset().top - wt - WH,
				mx = Math.max.apply(Math,dacol),
				mi = Math.min.apply(Math,dacol);


			if( !pg.lazyAdding && pg.pagerVisible && pg.caching && ( imm || distance <  c.scrollBias || distance < mx - mi ) ){
				c.lazyAdd.call(pg);
			}
		},

		/*
		@说明：判断是否触发 slideSubPage
		*/
		doLoadNext : function (){
			var pg = this,
				c = pg.config;

			// 当scrollTop + window窗口内页面可视高度 === more btn的offsetTop 时启动
			if( !pg.lazyAdding && !pg.halting && !pg.scrollLoading && pg.pagerVisible && (pg.caching < 2 || !pg.caching) && !pg.isLastSub() ){
				pg.scrollLoading = true,
				pg.slideSubPage(1);
			}
		}
	}



	/*
	@说明：Masn 类
	*/
	Woo.Masn = function ($cont,opts){
		this.init($cont,opts);
	}


	Woo.Masn.prototype = {
		/*
		@说明：Masn 类初始化方法
		@参数：
		$cont			- (Str) Masn 主容器，可以是dom selector or jquery对象
		opts			- (Dic) 参数说明详见类实例化的相关代码
		*/
		init: function ($cont,opts){
			this.opts = $.extend({}, opts)
			var masn = this;

			masn.$dom = $($cont),
			masn.domWidth = masn.$dom.data('domwidth') || 'auto',
			masn.figure(),
			masn.arrangeContents();
		},
		figure : function (){
			var masn = this,
				colY = [],
				$d = masn.$dom,
				c = masn.opts,
				exlen = 0,
				$cursor = $('<div>');

			$d.css({
				"position" : "relative"
			});


			// 计算列宽和列数
			masn.colwf = masn.colw = c.columnWidth;
			if( c.firstColumnWidth ){
				masn.colwf = c.firstColumnWidth;
			}


			masn.setCols();

			// 设置每列的初始高度为0
			for( var i=0; i<masn.colCount; i++ ){
				colY[i] = 0;
			}
			masn.$dom.data('colY',colY);

			$d.prepend( $cursor ),
			masn.offset0 = $cursor.offset(),
			masn.domtop0 =  $d.offset().top,
			masn.left0 = Math.round( $cursor.position().left ),
			$cursor.remove(),
			// 标记添加内容块的初始位置，以screen为单位
			masn.lastscreen = masn.screen = 0;

			// 根据 firstHeight 参数插入初始占位块
			if( c.firstHeight ){
				masn.firstWidth = masn.colwf,
				masn.firstHeight = c.firstHeight;
			}
		},
		clearColY : function (){
			var masn = this,
				colY = [];

			for( var i=0; i<masn.colCount; i++ ){
				colY[i] = 0;
			}
			masn.$dom.data('colY',colY);
		},
		setContHeight : function (){
			var masn = this,
				colY = masn.$dom.data('colY');

			masn.$dom
			.css({
				"height" : Math.max.apply(Math, colY.concat(WH - masn.domtop0))
			})
			.data('colY',colY)
		},

		/*
		@说明：重置 $dom 容器的宽度和列数
		*/
		setCols : function (){
			var masn = this,
				c = masn.opts,
				$dom = masn.$dom,
				dw;

			masn.resetDomWidth(),
			dw = $dom.width();

			masn.colCount = Math.max( Math.floor( (dw - masn.colwf + masn.colw) / masn.colw ), 1 ),
			$dom.css('width',masn.colCount*masn.colw + masn.colwf - masn.colw - c.columnMargin);
		},

		/*
		@说明：重置 $dom 容器的宽度为初始状态，resize时需要重置所有 MASN 的dom width
		*/
		resetDomWidth : function (){
			var masn = this;

			masn.$dom.css("width",masn.domWidth)
		},


		/*
		@说明：预先置入的内容通过此方法排列
		@参数：
		all				- (Bool) 为真则一次性排列所有预置内容，否则只排列一部分，其它的延迟处理
		*/
		arrangeContents : function (all){
			var masn = this,
				$d = masn.$dom,
				c = masn.opts,
				anum = c.initAppendCounts,
				$c,
				clen;

			$c = $d.children().filter(c.unit),
			clen = $c.length;
			if( clen ){
				// all 参数决定是否将所有预先填入的内容一次性加载
				all && (anum = clen);

				// 先加载 anum 个unit，剩下的交给 onArrage 方法处理
				var $madd = $c.slice(0,anum);
				$c = $c.slice(anum).addClass('woo-spec'),
				// all 参数这里用来判断是在进行 resize 
				masn.appendContents($madd,null,true,all,!!c.firstHeight,anum,$.noop);
			}

			// 初始状态，$dom 对应的主内容节点是 hidden 状态
			$d.css('visibility','visible');

			if( $.isFunction(c.onArrange) ){
				c.onArrange($c);
			}
		},

		/*
		@说明：分批依次处理数组数据
		@参数：
		$data			- (Obj) 带处理的 jQuery 数据
		htmlp			- (Str) html 字符串，将被加入到 $data
		indom			- (Bool) 为真表示待添加的 $data 已经在dom中，不需要重新append，同时htmlp 强制设为空
		resize			- (Bool) 是否resize 中
		addfirst		- (Num) 是否要在左侧(右侧)第一个位置添加占位区块
		nm				- (Num) 分批添加功能开启条件下，每批次的单元个数
		callback		- (Fun) 分批添加功能开启条件下，递归结束后执行的方法
		*/
		appendContents : function ($data,htmlp,indom,resize,addfirst,nm,callback){
			var masn = this,
				c = masn.opts,
				$d = masn.$dom,
				colY = $d.data('colY'),
				nm = nm || c.batchNum,
				minI,minY;


			// lastscreen 设置为上一次的screen 值
			masn.lastscreen = masn.screen;


			// 最后一个参数判定是否添加左(右)侧第一个位置节点
			var arr = masn._placeEachUnit(masn,c,$d,$data,htmlp,indom,resize,addfirst && masn.firstHeight),
				$u = arr[0],
				inner = arr[1];

			// indom为真表示待添加的 $data 已经在dom中，不需要重新append
			if( !indom ){
				$u.appendTo($d);

				// 使用 batchOpen 每批加载耗时会变长，但是整体效果会更平滑，请斟酌使用
				if( c.batchOpen ){
					// 递归添加节点，以达到时间利用的最佳效果
					Woo.recurseDo(function (b,inner){
						var m = 0;
						b.append(function (i){
							m++;
							return inner.eq(i).children();
						})
						c.onAppend(b),
						b = b.slice(nm),
						inner = inner.slice(m),
						//设置大容器的高度
						masn.setContHeight();

						return [b,inner];
					},[$u,inner],Math.ceil($u.length/nm),c.batchDelay,function (){
						callback(masn.lastscreen,masn.screen);
					});
				}else{
					$u.append(function (i){
						return inner.eq(i).children();
					})

					//设置大容器的高度
					masn.setContHeight(),
					c.onAppend($u),
					callback(masn.lastscreen,masn.screen);
				}
			}else{
				//设置大容器的高度
				masn.setContHeight();
			}
		},

		_placeCall : function ($e, colY, colc, f){
			var masn = this,
				c = masn.opts,
				len = colc,
				minY, minI, left, ht, colwf;

			minY = Math.min.apply(Math, colY);
			// 计算minY 所在的序号数
			while (len--){
				if( colY[len] == minY ){
					minI = len;
				}
			}

			// 判断minI 所在列是 woo-spcol 特殊列
			if( (minI === 0 && !c.rightAlignFirstBlock || minI === colc - 1 && c.rightAlignFirstBlock) && masn.colwf != masn.colw ){
				colwf = masn.colwf;
				!f && ($e.addClass('woo-spcol'))
			}


			// left 值需要先计算 minI 即最小colY 所在的列数
			left = masn.colw * minI + masn.left0 + ( !c.rightAlignFirstBlock && minI && masn.colwf != masn.colw ? masn.colwf - masn.colw : 0 ),

			// 高度计算优先取值 data-ht 可大大缩减计算时间
			ht = f ? masn.firstHeight : $e.data('ht') || $e.outerHeight(true),

			// 添加此节点后 colY 的minI 列高度随之改变
			colY[minI] += ht + c.gap,

			// 计算所在的screen 值
			masn.screen = Math.ceil( (minY + ht) / WH );

			return [minY, minI, left, ht, colwf];
		},

		_placeEachUnit : function(masn,c,$d,$data,htmlp,indom,resize,f){
			var $pre = $d.prev(),
				haspre = !!$pre.length,
				strwrap = '',
				$htmlp = $(null),
				colY = $d.data('colY'),
				colc = masn.colCount,
				ars,
				minY,
				minI,
				left,
				ht,
				colwf,
				mm = 0,
				addf,
				// 是否是resize 中，并且是要插入节点，可以断定resize前已经有插入节点
				resf = resize && f,
				// 要添加的节点，同时可用于判断是否有做添加(或移动)动作
				$addfc;

			if( !haspre || haspre && !$pre.hasClass('woo-tmpmasn') ){
				var frame = Woo.conf.frame,
					clss = (frame[3].indexOf(0) == '.' ? frame[3].substr(1) : '') +' '+(frame[5].indexOf(0) == '.' ? frame[5].substr(1) : '')+' woo-loading';
				$pre = $('<div class="woo-tmpmasn '+$d.attr('class')+'" style="position:relative;height:0;overflow:hidden;margin:0;padding:0;"></div>').removeClass(clss),
				$d.before($pre);
			}

			// indom 为true 时，  $data所有单元都已经在dom 树上，并且 htmlp 一定为空
			var $lame = $data.add(htmlp).removeClass('woo-spec'),
				$drawer = indom ? $lame.parent() : $pre.append($lame);

			$htmlp = $drawer.find(c.unit).not('.woo-f').each(function (i,e){
				var $e = $(e),
					id = $e.data('id');

				// 在左(右)侧第一个位置增加占位节点，之前如果有添加过(resize时)则删除
				if( (i === 0 && f && !c.rightAlignFirstBlock || i === colc - 1 && f && c.rightAlignFirstBlock) ){
					// 计算 minY minI left
					ars = masn._placeCall($e, colY, colc, f);

					minY = ars[0],
					minI = ars[1],
					left = ars[2],
					ht = ars[3],
					colwf = ars[4],



					// 要添加的节点外层字符串
					addf = '<div class="woo woo-f sc'+masn.screen+' co'+minI+' '+(colwf?'woo-spcol':'')+'" data-ht="'+ht+'" style="position:absolute;z-index:-1;overflow:hidden;top:'+minY+'px;left:'+left+'px;width:'+(masn.firstWidth-c.columnMargin)+'px;"></div>',

					strwrap += addf;

					// 如果是resize 中，并且已经有插入过节点
					if( resf ){
						$addfc = $drawer.find('.woo-f:first').css({
							"left" : left,
							"top" : minY
						});
					}else{
						$addfc = $(addf).append(c.sinkWhat);
					}

					mm = i;
				}

				// 计算 minY minI left
				ars = masn._placeCall($e, colY, colc);

				minY = ars[0],
				minI = ars[1],
				left = ars[2],
				ht = ars[3],
				colwf = ars[4],


				strwrap += '<div class="'+c.unit.substr(1)+' sc'+masn.screen+' co'+minI+' '+(colwf?'woo-spcol':'')+'" '+ (id?'data-id="'+id+'"':'')+' data-ht="'+ht+'" style="top:'+minY+'px;left:'+left+'px;"></div>';


				$e.css({
					"top" : minY,
					"left" : left
				})
				.removeClass(function (i,cls){
					return 'woo-spcol ' + (cls.match(/(co|sc)\d+/ig) || []).join(' ')
				})
				.addClass((colwf ? 'woo-spcol ' : '')+'sc'+masn.screen+' co'+minI);
			})

			// 遍历结束后保存最终的 colY
			$d.data('colY',colY);

			// resf 判断是否resize 中，并且已经插入好节点
			if( !resf && f ){
				var arrp = $htmlp.toArray();
				$htmlp = $(arrp.slice(0,mm).concat($addfc.toArray(),arrp.slice(mm)))
			}

			$pre.empty();

			return [$(strwrap),$htmlp];
		}
	}

	$.Woo = Woo;
})(window)