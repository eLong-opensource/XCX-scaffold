var __dirname = "components/calendar";
var api = require("../../utils/api.js")(__dirname);

module.exports = function(params, callback){
	var event = api.Navigate.go({
		url: "./page/index",
		params:params
	});

	event.on("select", callback);
};