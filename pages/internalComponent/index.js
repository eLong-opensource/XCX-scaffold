/**
 * 集成组件dome
 */
var __dirname = 'pages/internalComponent',
    __overwrite = require('../../utils/overwrite.js');
(function(require, Page) {
    var filter = require('./filter/index');
    Page({
        /**
         * 默认数据
         * @type {Object}
         */
        data: {
            hbList: {
                unused: 0,
                used: 1,
                expire: 0
            },
            // 筛选器相关
            filterData: {
                // 分类：全部，国内酒店，国际酒店
                category: [{
                    id: 0,
                    key: 'filterCategory0',
                    name: '全部',
                    selected: true
                }, {
                    id: 1,
                    key: 'filterCategory1',
                    name: '国内酒店',
                    selected: false
                }, {
                    id: 2,
                    key: 'filterCategory2',
                    name: '国际酒店',
                    selected: false
                }],
                // 类别：可使用，已使用，已过期
                type: [{
                    id: 0,
                    key: 'filterType0',
                    name: '可使用',
                    selected: true
                }, {
                    id: 1,
                    key: 'filterType1',
                    name: '已使用',
                    selected: false
                }, {
                    id: 2,
                    key: 'filterType2',
                    name: '已过期',
                    selected: false
                }]
            },
            openedFilter: ''
        },

        /**
         * 展开筛选器
         * @param  {Object} e
         */
        openFilter: function(e) {
            var _self = this,
                _filterType = e.currentTarget.dataset.filterType,
                _filterName = _filterType + 'Filter',
                _filterComponent = _self.components[_filterName],
                _filterComponentItems = _self.data.filterData[_filterType],
                _selectedId = 0

            // 找到被选中的id
            _filterComponentItems.forEach(function(item) {
                if (item.selected == true) {
                    _selectedId = item.id
                }
            })

            // 关闭所有筛选器
            _self.closeOtherFilter(_filterName)

            // 配置数据
            _filterComponent.init(_filterComponentItems, _selectedId)

            // 判断并改变筛选器状态
            if (_filterComponent.data.isOpen) {
                _filterComponent.close()
            } else {
                _filterComponent.open()
            }
        },

        /**
         * 关闭所有筛选器
         * @param  {String} filterName 不关闭的
         */
        closeOtherFilter: function(filterName) {
            var _self = this,
                _keys = Object.keys(_self.components)
            _keys.forEach(function(key) {
                if (filterName && filterName != key) {
                    _self.components[key].close()
                }
            })
        },

        /**
         * 过滤器选中后的回调函数
         * @param  {Object} options
         */
        filterChangedCallBack: function(options) {
            var _self = this,
                _filterName = options.instanceName.replace('Filter', ''),
                _selectedId = options.data.id,
                _filterDataTmp = _self.data.filterData

            // 记录选中结果
            _filterDataTmp[_filterName].forEach(function(item) {
                if (item.id == _selectedId) {
                    item.selected = true
                } else {
                    item.selected = false
                }
            })
            _self.setData({
                filterData: _filterDataTmp
            });
        },

        /**
         * 过滤器展开后的回调函数
         * @param  {Object} options
         */
        filterOpenedCallBack: function(options) {
            this.setData({
                openedFilter: options.instanceName
            })
        },

        /**
         * 过滤器关闭后的回调函数
         * @param  {Object} options
         */
        filterClosedCallBack: function(options) {
            this.setData({
                openedFilter: ''
            })
        },
        onLoad: function(options) {},
    }, [{
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
