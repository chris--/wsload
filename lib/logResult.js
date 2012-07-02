/**
*	logResult.js
*		Logs a result to a persistent storage. 
*
*	Functions:
*		logResult.savePersistent(param_string, param_cb)
*
*	Usage:
*		var logger = require('./logResult.js');
*		logger.savePersistent('string',function(err){
*			if(err){console.log('error occured');
*		});
*/

//var logResult = module.exports;
var mongo = require('mongodb');



var Logger = module.exports = function(param_settings, param_cb) {
	
	this.db = new mongo.Db('test', new mongo.Server('localhost',mongo.Connection.DEFAULT_PORT, {}), {});
	this.db.open(function(err, db) {
	  if (err) {
	  	throw Error("Logger: Cannot open Database");
	  }
	});
	
	this.settings = param_settings;
	this.cb = param_cb;
}

Logger.prototype = {
	logToDb: function(param_logMessage) {
		 this.db.createCollection('suites', function(err, collection) {
			if(!err){
				collection.insert(param_logMessage, {safe:true}, function(err, result){
					if(!err) {
						if (this.cb) {
							cb(null, result);
						}
					} else {
						if (this.cb) {
							cb('Logger: Insertion failed', null);
						}
					}
				});
			}
		});
	}.
	logToConsole: function(param_logMessage) {
		console.log(param_logMessage);
	}, 
	log: function(param_logMessage) {
		this.logToDb(param_logMessage);
		//this.logToConsole(param_logMessage);
	}
}
/*
logResult.savePersistent = function(param_string, param_cb) {
	
}
*/