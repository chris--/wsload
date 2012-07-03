/**
*	Logger.js
*		Logs a result to a persistent storage. 
*
*	Constructor:
*		Logger(param_settings)
*	public Methods:
*		log(param_logMessage, (optional) param_cb)
*
*	Usage:
*		var Logger = require('Logger');
*		var logger = new Logger(null);
*		logger.log('logMessage',function(err){ //optional callback to check for errors 
*			if(err){console.log('error occured')}
*		});
*/
var Logger = module.exports = function(param_settings) {

	var mongo = require('mongodb');	
	this.db = new mongo.Db('wsload', new mongo.Server('localhost',mongo.Connection.DEFAULT_PORT, {}), {});
	this.db.open(function(err, db) {
	  if (err) {
	  	throw Error("Logger: Cannot open Database");
	  }
	});
	
	this.settings = param_settings;

}

Logger.prototype = {
	_logToDb: function(param_logMessage, param_cb) {
		 this.db.createCollection('suites', function(err, collection) {
			if(!err){
				collection.insert(param_logMessage, {safe:true}, function(err, result){
					if(!err) {
						if (param_cb) {
							param_cb(null, result);
						}
					} else {
						if (param_cb) {
							param_cb('Logger: Insertion failed', null);
						}
					}
				});
			} else {
				if(param_cb) {
					param_cb(err,null);
				}
			}
		});
	},
	_logToConsole: function(param_logMessage) {
		console.log(param_logMessage);
	}, 
	log: function(param_logMessage, param_cb) {
		this._logToDb(param_logMessage, param_cb);
		//this.logToConsole(param_logMessage);
	},
	close: function() {
		this.db.close();
	}
}
/*
logResult.savePersistent = function(param_string, param_cb) {
	
}
*/