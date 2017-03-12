/**
 * 页面事件dome
 */
var __dirname = 'pages/list',
  __overwrite = require('../../utils/overwrite.js');
(function (require, Page) {
  var app = getApp();
  var service = require('service/demo');
  Page({
    data: {
      serverDate: new Date
    },
    onLoad: function (data) {
      if (data.name === 'billy') {
        this.fireEvent("listok", 'hello ' + data.name);
      }
    },
    //事件处理函数
    getServerDate: function () {
      var that = this;
      var serverDate = service.GetTime().then(function (date) {
        that.setData({
          serverDate: date
        });
      });
    },
  })
})(__overwrite.require(require, __dirname), __overwrite.Page);