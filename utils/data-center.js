var __dirname = "utils";
var api = require("../utils/api.js")(__dirname);

var listeners = {};
var globalData;

function checkGlobalData(){
	if(!globalData){
		var app = getApp();
		if(!app.globalData){
			app.globalData = {};
		}
		globalData = app.globalData;
	}
}

module.exports = {
	get: function(key){
		checkGlobalData();
		return globalData[key];
		//return api.Cache.get(key);
	},
	set: function(key, value){
		checkGlobalData();
		//api.Cache.set(key, value);
		globalData[key] = value;

		if(listeners[key]){
			listeners[key].forEach(function(listener){
				listener(value);
			});
		}
	},
	_on: function(key, listener){
		if(!listeners[key]){
			listeners[key] = [];
		}

		listeners[key].push(listener);
	},
	on: function(keys, listener){
		if(typeof keys === "string"){
			keys = [keys];
		}
		keys.forEach(function(key){
			this._on(key, listener);
		}.bind(this));
	},
	_off: function(key, listener){
		var lis = listeners[key];
		if(lis){
			var index = lis.indexOf(listener);
			if(index !== -1){
				lis.splice(index, 1);
			}
		}
	},
	off: function(keys, listener){
		if(typeof keys === "string"){
			keys = [keys];
		}
		keys.forEach(function(key){
			this._off(key, listener);
		}.bind(this));
	}
};