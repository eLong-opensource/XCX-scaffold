#艺龙小程序框架
> 目录结构
```
├── README.MD
├── app.js
├── app.json
├── app.wxss
├── components
├── image
├── pages
├── service
└── utils
    ├── api.js
    ├── cookie.js
    ├── data-center.js
    ├── overwrite.js
    ├── page-events.js
    ├── path.js
    ├── promise.js
    └── service.js
```

> 框架使用说明

- 框架对所有[微信](https://mp.weixin.qq.com/debug/wxadoc/dev/)原生`api`进行了一层包装，以便**管控**和**扩展**。
```js
//index.js
var api = require("./utils/api.js")();
api.login({
    success: function(res) {
        console.log(res);
    }
});
```

```
//api.js
login: function() {
    //其他处理
    return wx.login(arguments);
}
```

- 对于后端接口，框架提供`service`层进项管理，接口返回一个**Promise**对象。
```js
//demo.js
var Service = require("../utils/service.js");
module.exports = {
    GetTime: Service({
        url: 'https://xxx.xxx.xxx/api/getserverdate/',
        params: [], //参数列表
        method: 'GET',
        noLoading: true,
        mockData: function() { //模拟数据
            return new Date();
        },
        dataTransform: function(data) { //适配处理
            return data;
        }
    })
};
```

```
//index.js
var service = require('service/demo'); //框架约定，所有的后端接口，要注册到对应的service文件中
var serverDate = service.GetTime( /*service可配置参数列表，这里传入相对应的参数*/ ).then(function(date) {
    that.setData({
        serverDate: date
    });
});
```

- 小程序不支持`cookie`机制，若要兼容现有后端`cookie`处理（不做改动），可使用框架模拟的**cookie机制**。
```js
//index.js
var COOKIE = require('./cookie.js');
var expire = new Date().getTime() + res.expire * 1000;
COOKIE.set(key, value, expire);
```

```
//service.js
//...
headers["Cookie"] = Cookie.getAll(); //用户cookie将随http请求发送至服务器
//...
```

- `Page()` 函数用来注册一个页面。接受一个`object`参数，其指定页面的初始数据、生命周期函数、事件处理函数等，框架对`Page`做了重写，这样可以方便的使用扩展能力，使用时仅需将原来的业务代码用包装器包装一下即可。

```js
//微信小程序原生页面注册形式
Page({
    data: {},
    onLoad: function() {}
});
//框架重写注册形式
var __dirname = 'pages/index',
    __overwrite = require('../../utils/overwrite.js');
(function(require, Page) { //重写require、Page
    Page({
        data: {},
        onLoad: function() {}
    });
})(__overwrite.require(require, __dirname), __overwrite.Page);
```

- `globalData`监听，框架支持全局事件监听机制

```js
//index.js
var __dirname = 'pages/index',
    __overwrite = require('../../utils/overwrite.js');
(function(require, Page) {
    //获取应用实例
    var app = getApp();
    var service = require('service/demo');
    Page({
        data: {
            indate: '',
            indateText: ''
        },
        onLoad: function() {
            this.listenerGlobalData('indate', function(indate) {
                this.data.indate = indate
                this.data.indateText = new Date(indate).format('MM-dd')
            }.bind(this));
        }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);
```

- 事件机制，页面间跳转可以**传递数据**，框架支持页面间传递数据的同时，还可以通过跳转接口返回的事件对象监听**自定义事件**。

```js
//index页面
var event = api.Navigate.go({
    url: '../list/index',
    params: {
        name: 'billy'
    }
});
event.on("listok", function(params) {
    console.log(params);
});
```

```
//http页面
Page({
    onLoad: function(data) {
        if (data.name === 'billy') {
            this.fireEvent("listok", 'hello ' + data.name);
        }
    }
});
```

> 组件使用说明

- 内置组件
> 框架重写`Page`构造方法，内置了一些常用的组件，例如 `alert`、`picker`、`setLoading`，其中 **alert** 和 **setLoading** 内部分别封装了原生的 `wx.showModal` 、`wx.showToast`，封装使得调用参数结构化，方便业务使用，使用时不用引入页面结构，直接调用即可；**picker**则需要首先引入到页面中表现层结构，按照配置要求传递配置项。

```js
//setLoading
this.setLoading(true);//ture/false
```

```html
//picker 引入表现层结构
<!--index.wxml-->
<view class="container">
    <view class="userinfo">
        <text class="userinfo-nickname">{{current}}</text>
    </view>
    <include src="../../components/base.wxml" />
</view>
```

```
//picker 使用
__overwrite.picker({
    content: "选择排序",
    init: this.data.sortIndex,
    data: this.data.sortList,
    bindtap: function(id, index) {
        if (that.data.sort != id) {
            that.setData({
                sortIndex: index,
                current: this.data.sortList[index].text
            });
        }
    },
    bindcancel: function() {
        console.log('cancel')
    }
});
```

```
//alert
__overwrite.alert({
    content: '弹框对话框，参数配置详见文档说明',
    cancelText: '取消',
    bindconfirm: function() {
        console.log('确定');
    },
    bindcancel: function() {
        console.log('取消');
    }
});
```

- 独立页面组件
> 独立页面组件其实就是一个完整的页面单元（`js`、`wxml`、`wxss`组成），使用很简单，通过引入相关`js`方法，调用打开组件即可（可传递`callback`用于数据交换处理）。--*其实现原理是组件提供的`js`方法将会打开一个新页面（`api.Navigate.go`），并通过注册事件的形式交互行为数据*

```js
//index.js
var __dirname = 'pages/externalComponent',
    __overwrite = require('../../utils/overwrite.js');
require('../../utils/dateFormat.js');

(function(require, Page) {
    //获取应用实例
    var app = getApp();
    var CalendarPlugin = require('components/calendar/index');
    Page({
        data: {
            date: {
                indate: new Date().format('yyyy-MM-dd'),
                outdate: new Date(+new Date + 3600000 * 24).format('yyyy-MM-dd')
            }
        },
        openCalendar: function() {
            var that = this;
            CalendarPlugin({
                begin: that.data.date.indate,
                end: that.data.date.outdate
            }, function(res) {
                that.data.date.indate = res.start.format('yyyy-MM-dd');
                that.data.date.outdate = res.end.format('yyyy-MM-dd');
                that.setData({
                    date: that.data.date
                })
            })
        },
        onLoad: function(data) {

        }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);
```

- 页面级组件

> 框架重写`Page`构造器，支持构建页面时配置一个或多个页面级组件，所谓页面级组件就是该组件的注册形式和页面一致(支持`data`数据，`onLoad`、`onReady`、`onShow`生命周期事件，`fireEvent`、`showLoading`等页面级方法)，其实现原理是将组件的所有**成员方法**和**成员属性**和**依附页面**进行合并，并解决了重名冲突，使用者不用关心处理细节，只管像注册一个页面一样注册组件。--*需要注意的是页面级别组件不可再次使用`Page`构造方法*。

> 1、引入组件表现层结构

```html
<!--index.wxml-->
<view class="container">
    <view class="userinfo">
        <!--当前页面数据-->
    </view>
    <!--引入组件页面结构-->
    <include src="../../components/base.wxml" />
</view>
```

> 2、引入组件样式表

```css
/**引入组件样式表**/
@import "filter/index.wxss";
page { background: #f4f4f4; }
```

> 3、注册页面时注入组件

```js
/**
 * 集成组件dome
 */
var __dirname = 'pages/internalComponent',
    __overwrite = require('../../utils/overwrite.js');
(function(require, Page) {
    /*引入组件js*/
    var filter = require('./filter/index');
    Page({
        /**
         * 默认数据
         * @type {Object}
         */
        data: {...},
        onLoad: function(options) {},
    }, [{//注入组件
        component: filter,
        instanceName: 'typeFilter',
        props: {
            style: { top: '44px' }
        },
        events: {
            onChange: 'filterChangedCallBack',
            onOpen: 'filterOpenedCallBack',
            onClose: 'filterClosedCallBack'
        }
    }, {
        component: filter,
        instanceName: 'categoryFilter',
        props: {
            style: { top: '44px' }
        },
        events: {
            onChange: 'filterChangedCallBack',
            onOpen: 'filterOpenedCallBack',
            onClose: 'filterClosedCallBack'
        }
    }])
})(__overwrite.require(require, __dirname), __overwrite.Page)
```

> 页面级组件由`*.js`、`*.wxml`、`*.wxss`组成，分别由注册页面引入，其中`js`部分不可再次使用`Page`构造

```
├── index.js
├── index.wxml
└── index.wxss
```

```js
//页面级组件js声明
/**
 * 筛选器
 */
var __dirname = 'pages/internalComponent/filter',
    api = require('../../../utils/api.js')(__dirname)

var bgAnimation = api.createAnimation({
        duration: 200
    }),
    contentAnimation = api.createAnimation({
        duration: 200
    });

module.exports = {
    data: {
        items: [],
        selectedId: '',
        bgAnimation: {},
        contentAnimation: {},
        isOpen: false
    },

    /**
     * 监听组件加载
     * @param  {Object} props
     */
    onLoad: function(props) {
        this.setData({
            style: props.style
        })
    },

    /**
     * 初始化
     * @param  {Array} items
     * @param  {String | Number} selectedIndex
     */
    init: function(items, selectedIndex) {},

    /**
     * 选中
     * @param  {Object} e
     */
    select: function(e) {
    }
}

```
