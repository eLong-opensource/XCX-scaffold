var __dirname = "utils";
var api = require("./api.js")(__dirname);
var Cookie = require("./cookie.js");
var overwrite = require("./overwrite.js");
var Promise = require("./promise.js")
var requestingCount = 1;
var waitingList = [];

function onComplete() {
    if (requestingCount < 5 && waitingList.length) {
        waitingList.shift()(onComplete);
    }
}
module.exports = function(config) {
    return function() {
        var params;
        // 假如配置了参数列表，则按参数列表序列化参数
        if (config.params) {
            params = {};
            for (var i = 0, l = Math.min(config.params.length, arguments.length); i < l; i++) {
                params[config.params[i]] = arguments[i];
            }
        } else {
            params = arguments[0];
        }

        var cacheKey;
        if (config.cache) {
            cacheKey = JSON.stringify({
                url: config.url,
                params: params
            });
            var cacheData = api.Cache.get(cacheKey);
            if (cacheData) {
                return Promise.resolve(cacheData);
            }
        }
        return new Promise(function(resolve, reject) {
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            var headers = Object.assign({
                "X-Requested-With": "XMLHttpRequest",
                "osVersion":wx.getSystemInfoSync().system
            }, config.headers || {});
            var method = (config.method || "GET").toUpperCase();
            if (config.mockData) {
                var data = config.mockData();
                if (config.dataTransform) {
                    data = config.dataTransform(data);
                }
                if (data.errorCode && data.errorCode != '0') {
                    reject(data);
                } else {
                    resolve(data);
                }
            } else {
                if (config.dataType === "form-data" && typeof params === "object") {
                    params = (function(params) {
                        var formData = [];
                        for (var key in params) {
                            formData.push([key, encodeURIComponent(params[key])].join("="));
                        }
                        return formData.join("&");
                    })(params);
                    if (!headers['content-type']) {
                        headers['content-type'] = 'application/x-www-form-urlencoded';
                    }
                } else {
                    headers['content-type'] = 'application/json';
                }

                // 请求时默认带上cookie
                headers["Cookie"] = Cookie.getAll();

                function request(onComplete) {
                    requestingCount++;
                    api.request({
                        url: config.url,
                        data: params,
                        header: headers,
                        method: method,
                        success: function(result) {
                            var data;
                            if (result.statusCode == 200) {
                                data = result.data;
                                if (data.errorCode && data.errorCode != '0') {
                                    reject(data);
                                } else {
                                    if (config.dataTransform) {
                                        data = config.dataTransform(data);
                                    }
                                    if (config.cache) {
                                        api.Cache.set(cacheKey, data);
                                    }
                                    resolve(data);
                                }
                            } else {
                                reject({
                                    errorCode: 'STATUS_CODE_NO_200',
                                    errorMessage: result.errMsg,
                                    result: result
                                });
                            }
                        },
                        fail: function(result) {
                            reject({
                                errorCode: 'REQUEST_FAIL',
                                errorMessage: result.errMsg,
                                result: result
                            });
                        },
                        complete: function(result) {
                            console.log('request >> ', config.url, ',request Data = ', params, ' , result = ', result);
                            requestingCount--;
                            onComplete();
                        }
                    });
                }

                if (requestingCount < 5) {
                    request(onComplete);
                } else {
                    waitingList.push(request);
                }
            }
        });
    };
};
