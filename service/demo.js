var Service = require("../utils/service.js");
module.exports = {
    GetTime: Service({
        url: 'https://xxx.xxx.xxx/api/getserverdate/',
        params: [],//参数列表
        method: 'GET',
        noLoading: true,
        mockData: function () {//模拟数据
            return new Date();
        },
        dataTransform: function (data) {//数据适配处理
            //data adapter
            return data;
        }
    })
};