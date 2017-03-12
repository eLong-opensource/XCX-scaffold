/**
 * 外部组件dome
 */
var __dirname = 'pages/externalComponent',
    __overwrite = require('../../utils/overwrite.js');
require('../../utils/dateFormat.js');

(function(require, Page) {
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
    });
})(__overwrite.require(require, __dirname), __overwrite.Page);
