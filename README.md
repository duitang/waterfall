堆糖瀑布流(Woo) jQuery完整版
========

### 涵盖以下特点：

<strong>o)</strong> 数据配置灵活，可在html 里直接放置瀑布流单元(一般只放第一子页)。

<strong>o)</strong> 数据格式灵活，可处理josn格式的数据(推荐)，也可兼容html字符串格式的数据。

<strong>o)</strong> 独立的数据控制文件 masnunit.js。

<strong>o)</strong> 同一页面上通过tab 切换植入多个不同类型的瀑布流，切换无刷新。

<strong>o)</strong> 不同于infinite 瀑布流，可进行翻页控制。子页数量设置无限大时等同于infinite。

<strong>o)</strong> 实现hash 无刷新翻页，并兼容浏览器的前进后退功能。

<strong>o)</strong> 至页底时，会预加载下一页第一子页内容。

<strong>o)</strong> 根据当前环境自动控制瀑布流列数，可自适应屏幕宽度，也可通过 data-domwidth 设置固定宽度。

<strong>o)</strong> 可采用 sink 模式，在瀑布流左侧或右侧第一列嵌入外部区块。

<strong>o)</strong> 可配置直接向前(后)翻页的小翻页器。

<strong>o)</strong> 自带回到顶部功能，并能控制距离顶部的准确位置，准确说是回到预埋锚点的位置(可设置偏移量)。

<strong>o)</strong> 强大的 window resize 自动重绘功能(IE下不建议打开此功能)。

<strong>o)</strong> 灵活的参数设置，比如：子页数量、子页内单元数量、瀑布流单元宽度和间距 等等等等。


### [纯静态demo演示地址1](http://www.duitang.com/app/woo/examples/main.html)
### [纯静态demo演示地址2](http://www.duitang.com/app/woo/examples/sinkleft.html)
### [纯静态demo演示地址3](http://www.duitang.com/app/woo/examples/sinkright.html)


### 一些保留命名 >>

> co(n)              单元块所在列数对应的className

> sc(n)              单元块所在屏数对应的className

> woo-(*)            Woo内部特殊用途的className or id

> woo-form-(*)       form 表单的 id，用作请求地址url的拼装

> srcd               单元块内的图片src 属性的替代，图片延迟加载功能使用


### 一些依赖 >>

> 依赖 browser.js 用于兼容1.10 及以上jQuery 版本的$.browser 对象

> 依赖 history.js 监控hashchange 事件

> 依赖(非必需) template.min.js 组装html 字符串，详见 masnunit.js

> 依赖 tabswitch.js 用于不同瀑布流的切换


### 一些使用方法 >>

> 1) 在main.html 代码底部每一个&lt;form &gt;对应一个瀑布流的数据请求地址。

> 2) 如页面上只需要一个瀑布流，请相应的删除掉多余的form 表单和 .woo-swa .woo-swb节点。

> 3) 如不给定 .woo-masned 节点的宽度，会自动适应屏幕宽度。专辑类型示例中给定了 1000px 的宽度。

> 4) .woo-pcont 节点内可预先放好若干个单元(个数没有限制)，预先放置的会被当做第一子页数据，后面会直接从第二子页开始。

> 5) 一个页面可以有多个瀑布流，不同瀑布流的配置可以差异化。通过在各自.woo-pcont节点上设置 data- 属性，例如：data-subpagenum data-unitsnum data-sink来覆盖全局配置。

> 6) .woo-pcont节点上目前支持的data- 配置有：data-subpagenum data-unitsnum data-totalunits data-wootemp data-sink data-sinkheight data-sinkright。

> 7) data-wootemp 取值为从0开始的整数，对应 masnunit.js 文件里定义的不同类型瀑布流。

> 8) 示例使用了DEBUG 并分别在 main.html 和 masnunit.js 里给定了模拟数据。

> 9) 可在 masnunit.js 里编写不同种类的瀑布流，示例给出了两种：图片类型和专辑类型。

> 10) 请仔细研究 masnunit.js。

 
