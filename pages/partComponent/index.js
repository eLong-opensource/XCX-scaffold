//局部组件dome
var __dirname = 'pages/partComponent',
    __overwrite = require('../../utils/overwrite.js');
(function (require, Page) {
    var app = getApp()
    Page({
        data: {
            loadingState: 0,
            current: '默认排序',
            sortIndex: 0,
            sortList: [{ id: 0, text: '默认排序' }, { id: 2, text: '价格 高->低' }, { id: 1, text: '价格 低->高' }, { id: 5, text: '评分 高->低' }, { id: 4, text: '星级 高->低' }, { id: 6, text: '距离 近->远' }],
        },
        openPicker: function () {
            var that = this;
            __overwrite.picker({
                content: "选择排序",
                init: this.data.sortIndex,
                data: this.data.sortList,
                bindtap: function (id, index) {
                    if (that.data.sort != id) {
                        that.setData({
                            sortIndex: index,
                            current: this.data.sortList[index].text
                        });
                    }
                },
                bindcancel: function () {
                    console.log('cancel')
                }
            });
        },
        showLoading: function () {
            this.setData({
                loadingState: !this.data.loadingState
            })
            this.setLoading(this.data.loadingState);
        },
        showModal: function () {
            __overwrite.alert({
                content: '弹框对话框，参数配置详见文档说明',
                cancelText: '取消',
                bindconfirm: function () {
                    console.log('确定');
                },
                bindcancel: function () {
                    console.log('取消');
                }
            });
        },
        onLoad: function () {

        }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);
