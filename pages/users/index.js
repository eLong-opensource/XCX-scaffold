//用户中心
var __dirname = 'pages/users',
    __overwrite = require('../../utils/overwrite.js');
(function (require, Page) {
    var app = getApp()
    Page({
        data: {
            motto: '用户中心',
            userInfo: {}
        },
        onLoad: function () {
            var that = this
            //调用应用实例的方法获取全局数据
            app.getUserInfo(function (userInfo) {
                //更新数据
                that.setData({
                    userInfo: userInfo
                })
            })
        }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);
