var PageEvents = require("./page-events.js");
var DataCenter = require("./data-center.js");

var Cookie = require('./cookie');

var THIS_CHECK = /\bthis\.[a-zA-Z0-9_]+\b/;
var PAGE_EVENTS = ["onLoad", "onReady", "onShow", "onHide", "onUnload"];

var api = require('./api.js')();
// 将组件实例扩展到页面中
function extendComponents(page, components) {
    var componentHash = {};

    components.forEach(function(component) {
        var instanceName = component.instanceName;
        var props = component.props || {};
        var events = component.events || {};
        var component = component.component;

        var data = page.data[instanceName] = Object.assign({}, component.data);

        function transData(data) {
            var newData = {};
            for (var key in data) {
                newData[instanceName + "." + key] = data[key];
            }
            return newData;
        }

        var _component = {};
        var _events = _component._events = {};
        var fnNameHash = {};

        function packageFn(fn, name) {
            var notOnLoad = name !== "onLoad";
            return function() {
                var temp = {},
                    fnName,
                    result;

                if (this._runing_instance_name === instanceName) {
                    result = fn.apply(this, arguments);
                } else {
                    temp.data = this.data;
                    notOnLoad && (this.data = temp.data[instanceName]);
                    temp.setData = this.setData;
                    this.setData = function(data) {
                        notOnLoad && (this.data = temp.data);
                        temp.setData.call(this, transData(data));
                        notOnLoad && (this.data = temp.data[instanceName]);
                    }.bind(this);
                    temp.fireEvent = this.fireEvent;
                    this.fireEvent = function(eventName, params) {
                        eventName = "on" + eventName.replace(/(^|\-)[a-z]/g, function(match) {
                            return match.replace("-", "").toUpperCase();
                        });
                        var _eventName = events[eventName];
                        if (_eventName) {
                            // 事件处理函数需要Page级的this
                            setTimeout(function() {
                                this[_eventName].call(this, {
                                    instanceName: instanceName,
                                    eventName: eventName,
                                    data: params
                                });
                            }.bind(this), 1);
                        }
                    };
                    temp.setTimeout = this.setTimeout;
                    this.setTimeout = function(handler, timeout) {
                        return setTimeout(packageFn(handler).bind(this), timeout);
                    };

                    for (fnName in fnNameHash) {
                        temp["_" + fnName] = this[fnName];
                        this[fnName] = this[fnNameHash[fnName]];
                    }
                    temp._runing_instance_name = this._runing_instance_name;
                    this._runing_instance_name = instanceName;
                    !notOnLoad && this.setData(data);
                    result = fn.apply(this, arguments);
                    this._runing_instance_name = temp._runing_instance_name;
                    for (fnName in fnNameHash) {
                        this[fnName] = temp["_" + fnName];
                    }
                    this.fireEvent = temp.fireEvent;
                    this.setData = temp.setData;
                    notOnLoad && (this.data = temp.data);
                    temp = null;
                }

                return result;
            };
        }

        for (var key in component) {
            (function(key, fn) {
                if (key === "data") {
                    return;
                }

                var newKey;
                if (PAGE_EVENTS.indexOf(key) === -1) {
                    if (page[key]) {
                        console.warn("组件中的属性名" + key + "与页面冲突");
                    }

                    newKey = ["_component", instanceName, key].join("_");
                    data[key] = newKey;
                    fnNameHash[key] = newKey;
                } else {
                    newKey = key;
                }

                var _fn;
                // 待改变其他方法名
                if (typeof fn === "function" && THIS_CHECK.test(fn.toString())) {
                    _fn = packageFn(fn, key);
                } else {
                    _fn = fn;
                }

                if (PAGE_EVENTS.indexOf(key) !== -1) {
                    if (key === "onLoad") {
                        _events[key] = function(options) {
                            _fn.call(this, props, options || {});
                        };
                    } else {
                        _events[key] = _fn;
                    }
                } else {
                    page[newKey] = _component[key] = _fn;
                }
            })(key, component[key]);
        }

        componentHash[instanceName] = _component;
    });
    return componentHash;
}

var overwrite = {
    require: function(require, __dirname) {
        return function(url) {
            if (!/\.[a-z]+$/.test(url)) {
                url += ".js";
            }

            if (!/^\.{1,2}\//.test(url)) {
                if (__dirname) {
                    url = __dirname.split("/").map(function(item) {
                        return "..";
                    }).join("/") + "/" + url;
                } else {
                    url = "./" + url;
                }
            }

            return require(url);
        }
    },
    Page: function(config, components) {
        // 设置全局数据
        config.setGlobalData = function(key, value) {
            DataCenter.set(key, value);
        };
        // 获取全局数据
        config.getGlobalData = function(key) {
            return DataCenter.get(key);
        };
        // 监听全局数据
        config._gd_listener_list = [];
        config.listenerGlobalData = function(keys, listener) {
            this._gd_listener_list.push({
                keys: keys,
                listener: listener
            });
            DataCenter.on(keys, listener);
        };

        // onLoad
        var onLoad = config.onLoad;
        config.onLoad = function(options) {
            this._eventId = options._eventId;
            delete options._eventId;
            var params = PageEvents.getParams(this._eventId);
            options = Object.assign(options, params);

            this.components = {};
            // 混入组件
            if (components) {
                this.components = extendComponents(this, components);
            }

            // 如果options内有of值，则将其存储在Cache中
            if (!!options.of) {
                api.Cache.set('of', options.of)
            }

            Object.keys(this.components).forEach(function(instanceName) {
                var component = this.components[instanceName];
                var fn;
                for (var key in component) {
                    fn = component[key];
                    if (typeof fn === "function") {
                        component[key] = fn.bind(this);
                    }
                }
                Object.defineProperties(component, {
                    data: {
                        get: function() {
                            return this.data[instanceName];
                        }.bind(this)
                    }
                });
            }.bind(this));

            onLoad && onLoad.call(this, options);
            Object.keys(this.components).forEach(function(instanceName) {
                var _events = this.components[instanceName]._events;
                if (_events.onLoad) {
                    _events.onLoad.call(this, options);
                }
            }.bind(this));
            PageEvents.fire(this._eventId, "load", options);
        };

        // onReady
        var onReady = config.onReady;
        config.onReady = function() {
            onReady && onReady.call(this);
            Object.keys(this.components).forEach(function(instanceName) {
                var _events = this.components[instanceName]._events;
                if (_events.onReady) {
                    _events.onReady.call(this);
                }
            }.bind(this));
            PageEvents.fire(this._eventId, "ready");
        };

        // onShow
        var onShow = config.onShow;
        config.onShow = function() {
            onShow && onShow.call(this);
            Object.keys(this.components).forEach(function(instanceName) {
                var _events = this.components[instanceName]._events;
                if (_events.onShow) {
                    _events.onShow.call(this);
                }
            }.bind(this));
            PageEvents.fire(this._eventId, "show");
        };

        // onHide
        var onHide = config.onHide;
        config.onHide = function() {
            onHide && onHide.call(this);
            Object.keys(this.components).forEach(function(instanceName) {
                var _events = this.components[instanceName]._events;
                if (_events.onHide) {
                    _events.onHide.call(this);
                }
            }.bind(this));
            PageEvents.fire(this._eventId, "hide");
        };

        // onUnload
        var onUnload = config.onUnload;
        config.onUnload = function() {
            Object.keys(this.components).forEach(function(instanceName) {
                var _events = this.components[instanceName]._events;
                if (_events.onUnload) {
                    _events.onUnload.call(this);
                }
            }.bind(this));
            onUnload && onUnload.call(this);
            PageEvents.fire(this._eventId, "unload");
            PageEvents.destroy(this._eventId);
            this._gd_listener_list.forEach(function(item) {
                DataCenter.off(item.keys, item.listener);
            });
        };

        // 触发页面自定义事件方法
        config.fireEvent = function(eventName, params) {
            PageEvents.fire(this._eventId, eventName, params);
        };

        // 基础组件数据容器
        config.data.__baseComponent__ = {};

        //picker组件
        config.data.__baseComponent__.picker = {
            data: [],
            content: "",
            multiple: false,
            init: 0,
            confirmText: "确定",
            cancelText: "取消",
            hidden: "picker_hide",
            noCancel: true,
            bghidden: true,
            bindconfirm: "__picker_confirm_handler__",
            bindcancel: "__picker_cancel_handler__",
            bindtap: "__picker_bindtap_handler__",
            _picker_hide: "_picker_hide"
        };

        config.loadingConfig = {
            title: '加载中...',
            icon: 'loading',
            duration: 10000,
            showC: 0
        };
        /*
         * setLoading delay, text 可选
         */
        config.setLoading = function(flag, text) {
            if (flag) {
                config.loadingConfig.showC += 1;
            } else {
                config.loadingConfig.showC = Math.max(--config.loadingConfig.showC, 0);
            }
            if (flag || !config.loadingConfig.showC) {
                var setObj = Object.assign({}, config.loadingConfig);
                if (typeof text === 'string') {
                    setObj.title = text;
                }
                flag ? api.showToast(setObj) : api.hideToast();
            }
        };
        config.__picker_confirm_handler__ = function() {
            this.setData({
                "__baseComponent__.picker.hidden": "picker_hide",
                "__baseComponent__.picker.bghidden": true
            });
            // getCurrentPages()[getCurrentPages().length-1].picker_bindconfirm();
        }
        config.__picker_cancel_handler__ = function() {
            this.setData({
                "pageScrollFlag": true,
                "__baseComponent__.picker.hidden": "picker_hide",
                "__baseComponent__.picker.bghidden": true
            });

            var pages = getCurrentPages(),
                lastIndex = pages.length - 1;
            if (!!pages[lastIndex].picker_bindcancel) {
                pages[lastIndex].picker_bindcancel();
            }
        }
        config.__picker_bindtap_handler__ = function(e) {
            //debugger;
            //__baseComponent__.picker.bindtap
            if (this.data.__baseComponent__.picker.multiple) {

            } else {
                this.setData({
                    "__baseComponent__.picker.hidden": "picker_hide",
                    "__baseComponent__.picker.bghidden": true,
                    "__baseComponent__.picker.init": e.target.dataset.pickerIndex
                });
                var pages = getCurrentPages();
                pages[pages.length - 1].picker_bindtap(e.target.dataset.pickerId, e.target.dataset.pickerIndex)
            }
        }

        config._picker_hide = function() {
            this.setData({
                "pageScrollFlag": true,
                "__baseComponent__.picker.hidden": "picker_hide",
                "__baseComponent__.picker.bghidden": true
            });
        }
        Page(config);
    },
    picker: function(config) {
        var changeData = {
            "__baseComponent__.picker.bghidden": false
        };
        if (typeof config === "string") {
            changeData["__baseComponent__.picker.content"] = config;
        } else {
            var canConfigKeys = ["data", "content", "multiple", "confirmText", "cancelText", "noCancel", "bghidden", "init"];
            for (var key in config) {
                if (canConfigKeys.indexOf(key) !== -1) {
                    changeData["__baseComponent__.picker." + key] = config[key];
                }
            }
        }

        var pages = getCurrentPages(),
            lastIndex = pages.length - 1;
        pages[lastIndex].picker_bindtap = config["bindtap"];
        // pages[pages.length-1].picker_bindconfirm = config["bindconfirm"];
        pages[lastIndex].picker_bindcancel = config["bindcancel"];
        pages[lastIndex].setData(changeData);
        setTimeout(function() {
            pages[lastIndex].setData({
                "__baseComponent__.picker.hidden": "picker_show"
            });
        }, 100);
    },
    alert: function(config) {
        if (Object.prototype.toString.call(config) === '[object Object]') {
            config.bindconfirm && (config.confirm = config.bindconfirm); //兼容之前的 alert封装
            config.bindcancel && (config.cancel = config.bindcancel);
        } else {
            config = {
                content: config
            }
        }
        api.showModal(config);
    }
};
module.exports = overwrite;
