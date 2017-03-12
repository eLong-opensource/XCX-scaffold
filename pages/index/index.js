/**
 * 首页
 */
var __dirname = 'pages/index',
    __overwrite = require('../../utils/overwrite.js'),
    api = require('../../utils/api.js')(__dirname);
(function (require, Page) {
    var app = getApp();
    var service = require('service/demo');
    Page({
        data: {
            userInfo: {}
        },
        navigateToHttp: function () {
            var event = api.Navigate.go({
                url: '../http/index',
                params: {
                    name: 'billy'
                }
            });
            event.on("listok", function (params) {
                console.log(params)
            });
        },
        navigateToExternalComponent: function () {
            var event = api.Navigate.go({
                url: '../externalComponent/index'
            });
        },
        navigateToInternalComponent: function () {
            var event = api.Navigate.go({
                url: '../internalComponent/index'
            });
        },
        navigateToPartComponent: function (params) {
            var event = api.Navigate.go({
                url: '../partComponent/index'
            });
        },
        onLoad: function () {
            console.log('onLoad')
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
