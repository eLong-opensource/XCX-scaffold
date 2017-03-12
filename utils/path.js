var DIRNAME_RE = /[^?#]*\//;
var DOT_RE = /\/\.\//g;
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
var MULTI_SLASH_RE = /([^:/])\/+\//g;

module.exports = {
	dirname: function (path){
		// a/b/c/d => a/b/c/
		return path.match(DIRNAME_RE)[0].replace(/\/+$/, "");
	},
	join: function (){
		var path = Array.prototype.join.call(arguments, "/");

		// /a/b/./c/./d ==> /a/b/c/d
		path = path.replace(DOT_RE, "/");
		
		/**
		 *	a//b/c ==> a/b/c
		 *	a///b/////c ==> a/b/c
		 *	DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
		 */
		path = path.replace(MULTI_SLASH_RE, "$1/");
		
		// a/b/c/../../d  ==>  a/b/../d  ==>  a/d
		while (path.match(DOUBLE_DOT_RE)) {
			path = path.replace(DOUBLE_DOT_RE, "/");
		}
		
		return path;
	}
};