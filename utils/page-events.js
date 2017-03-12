var registerId = 0;
var events = {};

module.exports = {
	events: events,
	register: function(flags, params){
		var eventId = registerId ++;

		var event = events[eventId] = {
			flags: flags || {},
			params: params || {},
			listeners: {}
		};

		return {
			eventId: eventId,
			on: function(eventName, listener){
				if(!event.listeners[eventName]){
					event.listeners[eventName] = [];
				}
				event.listeners[eventName].push(listener);
			}
		};
	},
	fire: function(eventId, eventName, params){
		var event = events[eventId];

		if(event && event.listeners[eventName]){
			event.listeners[eventName].forEach(function(listener){
				listener(params);
			});
		}
	},
	getParams: function(eventId){
		var event = events[eventId];
		if(event){
			return event.params;
		}
		return {};
	},
	destroy: function(eventId){
		delete events[eventId];
	}
};