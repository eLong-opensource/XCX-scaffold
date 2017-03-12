/*
*   小程序cookie组件
*/

var API = require( './api.js' )();

var getValue = function( key, obj ) {
    if( obj && obj.expires ) {
        var time = new Date().getTime();
        if( obj.expires >= time ) {
            return obj.value
        }
        cookie.remove( key )
    }
    return null
};

var COOKIE_STORAGE_KEY = "cookie-storage-key";

var cookie = {
    _get: function() {
        return API.Storage.getSync( COOKIE_STORAGE_KEY ) || {};
    },
    get: function( key ) {
        var obj = this._get()[key];
        return getValue( key, obj );
    },
    set: function( key, value, expires ) {
        var cookie = this._get();
        //default 2 years
        expires = expires || ( new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000 );
        cookie[key] = { value: value, expires: expires };
        API.Storage.setSync( COOKIE_STORAGE_KEY, cookie );
    },
    remove: function(key){
        var cookie = this._get();
        delete cookie[key];
        API.Storage.setSync( COOKIE_STORAGE_KEY, cookie );
    },
    clear: function(key){
        if(key){
            // 为了兼容老的api
            this.remove(key);
        }else{
            API.Storage.setSync( COOKIE_STORAGE_KEY, {} );
        }
    },
    getAll: function(){
        var cookie = this._get();
        var strs = [];
        var value;
        for(var key in cookie){
            value = getValue(key, cookie[key]);
            if(value !== null){
                strs.push(key + "=" + encodeURIComponent(value));
            }
        }
        return strs.join("; ");
    },
    setAsync: function( key, value, expires, success, fail, complete ) {
        API.Storage.get( {
            key: COOKIE_STORAGE_KEY,
            success: function( cookie ) {
                cookie = cookie || {};
                //default 2 years
                expires = expires || ( new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000 );
                cookie[key] = { value: value, expires: expires };
                API.Storage.set( {
                    key: COOKIE_STORAGE_KEY,
                    data: cookie,
                    success: success,
                    fail: fail,
                    complete: complete
                } );
            },
            fail: function(e){
                fail && fail(e);
                complete && complete();
            }
        } );
    },
    getAsync: function( key, success, fail, complete ) {
        API.Storage.get( {
            key: COOKIE_STORAGE_KEY,
            success: function( cookie ) {
                cookie = cookie || {};
                var obj = cookie[key];
                success && success(getValue( key, obj ));
            },
            fail: fail,
            complete: complete
        } );
    }
};

module.exports = cookie;
