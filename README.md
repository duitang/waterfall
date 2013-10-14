# 堆糖瀑布流(Woo) jQuery完整版 #

version: 1.0.1

## 涵盖以下特点：

1. 数据配置灵活，可在 html 里直接放置瀑布流单元(一般只放第一子页)。
1. 数据格式灵活，可处理 josn 格式的数据(推荐)，也可兼容 html 字符串格式的数据。
1. 独立的数据控制文件 masnunit.js。
1. 同一页面上通过 tab 切换植入多个不同类型的瀑布流，切换无刷新。
1. 不同于 infinite 瀑布流，可进行翻页控制。子页数量设置无限大时等同于 infinite。
1. 实现 hash 无刷新翻页，并兼容浏览器的前进后退功能。
1. 至页底时，会预加载下一页第一子页内容。
1. 根据当前环境自动控制瀑布流列数，可自适应屏幕宽度，也可通过
`data-domwidth` 设置固定宽度。
1. 可采用 sink 模式，在瀑布流左侧或右侧第一列嵌入外部区块。
1. 可配置直接向前(后)翻页的小翻页器。
1. 自带回到顶部功能，并能控制距离顶部的准确位置，
准确说是回到预埋锚点的位置(可设置偏移量)。
1. 强大的 window resize 自动重绘功能( IE 下不建议打开此功能)。
1. 可通过配置参数激活特殊列(只能是最左或最右列)，此列宽度可不同于其它列。
1. 灵活的参数设置，比如：子页数量、子页内单元数量、瀑布流单元宽度和间距 等等等等。


* [纯静态demo演示地址1](http://www.duitang.com/app/woo/examples/main.html)
* [纯静态demo演示地址2](http://www.duitang.com/app/woo/examples/sinkleft.html)
* [纯静态demo演示地址3](http://www.duitang.com/app/woo/examples/sinkright.html)
* [纯静态demo演示地址4](http://www.duitang.com/app/woo/examples/specialcol.html)


## 一些保留命名 >>

```
co(n)              单元块所在列数对应的 className
sc(n)              单元块所在屏数对应的 className
woo-(*)            Woo 内部特殊用途的 className or id
woo-form-(*)       form 表单的 id，用作请求地址 url 的拼装
srcd               单元块内的图片 src 属性的替代，图片延迟加载功能使用
```


## 一些依赖 >>

* 依赖 browser.js 用于兼容1.10 及以上jQuery 版本的 `$.browser` 对象
* 依赖 history.js 监控 `hashchange` 事件
* 依赖(非必需) template.min.js 组装 html 字符串，详见 masnunit.js
* 依赖 tabswitch.js 用于不同瀑布流的切换


## 一些使用方法 >>

1. 在 main.html 代码底部每一个 `<form >` 对应一个瀑布流的数据请求地址。
1. 如页面上只需要一个瀑布流，请相应的删除掉多余的 form 表单和 `.woo-swa`
`.woo-swb` 节点。
1. 如不给定 `.woo-masned` 节点的宽度，会自动适应屏幕宽度。
专辑类型示例中给定了 1000px 的宽度。
1. `.woo-pcont` 节点内可预先放好若干个单元(个数没有限制)，
预先放置的会被当做第一子页数据，后面会直接从第二子页开始。
1. 一个页面可以有多个瀑布流，不同瀑布流的配置可以差异化。
通过在各自 `.woo-pcont` 节点上设置 `data-` 属性，例如：`data-subpagenum`
`data-unitsnum` `data-sink` 来覆盖全局配置。
1. `.woo-pcont` 节点上目前支持的 `data-` 配置有：`data-domwidth`
`data-subpagenum` `data-unitsnum` `data-totalunits` `data-wootemp`
`data-sink` `data-sinkheight` `data-sinkright`。
1. `data-wootemp` 取值为从0开始的整数，对应 masnunit.js 文件里定义的不同类型瀑布流。
1. 示例使用了 DEBUG 并分别在 main.html 和 masnunit.js 里给定了模拟数据。
1. 可在 masnunit.js 里编写不同种类的瀑布流，示例给出了两种：图片类型和专辑类型。
1. 请仔细研究 masnunit.js。

## 如果对本产品感兴趣，请关注博客：

[http://blog.duitang.com/2013/10/woo/](http://blog.duitang.com/2013/10/woo/)
 
## License

Duitang/Waterfall is published under the terms of the MIT License.

## Change Log

* **1.0.1** 2013-10-14
 * 新增 demo for mobile
 * 新增配置参数 gap
