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
    init: function(items, selectedIndex) {
        this.setData({
            items: items || [],
            selectedId: items && items.length ? items[selectedIndex || 0].id : ''
        })
    },

    /**
     * 选中
     * @param  {Object} e
     */
    select: function(e) {
        this.setData({
            selectedId: e.currentTarget.dataset.id
        })
        this.fireEvent('change', {
            id: e.currentTarget.dataset.id
        })
        var sltId = this.data.selectedId
        if (sltId == 0) {
            this.setData({ styTop: '13px' })
        } else if (sltId == 1) {
            this.setData({ styTop: '60px' })
        } else {
            this.setData({ styTop: '103px' })
        }
        this.close()
    },

    /**
     * 展开
     */
    open: function() {
        // 改变状态
        this.setData({
            isOpen: true
        })

        // 动画相关
        bgAnimation.opacity(1).step()
        contentAnimation.translateY(0).step()
        this.setData({
            bgAnimation: bgAnimation.export(),
            contentAnimation: contentAnimation.export()
        })

        // 触发事件
        this.fireEvent('open')
    },

    /**
     * 关闭
     */
    close: function() {
        // 动画相关
        contentAnimation.translateY(-this.data.items.length * 46 + 1).step()
        this.setData({
            contentAnimation: contentAnimation.export()
        })

        // 改变状态
        // this.setTimeout(function () {
        this.setData({
                isOpen: false
            })
            // }, 200)

        // 触发事件
        this.fireEvent('close')
    }
}
