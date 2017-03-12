var api = require("./utils/api.js")();
App({
    onLaunch: function () {
        //initialize
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            api.login({
                success: function (res) {
                    console.log('login:: success', res)
                    api.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo
                            console.log(that.globalData.userInfo)
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        },
                        fail: function (res){
                            console.log(res)
                        }
                    })
                }
            })
        }
    },
    globalData: {
        userInfo: null
    }
})
