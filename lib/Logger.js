/**
*	Logger.js
*		Logs a result to a persistent storage.
*
*	Constructor:
*		Logger(param_settings)
*	public Methods:
*		log(param_logMessage, (optional) param_cb)
*		get(param_uuid, param_cb)
*
*	Usage:
*		var Logger = require('Logger');
*		var logger = new Logger(null);
*		logger.log('logMessage',function(err){ //optional callback to check for errors
*			if(err){console.log('error occured')}
*		});
*		logger.get(uuid,function(err,result){console.log(result)})
*/
var MongoAdapter = require('./MongoAdapter.js');

var Logger = module.exports = function(param_settings) {
	
	this.consoleOutput = false;
	this.settings = param_settings;
	this.openLogSaves = 0;

	//open database
	var that = this;
	MongoAdapter.getInstance(function(err,param_db){
		if(err) {
			console.log('could not open database, using console');
			this.consoleOutput = true;
		}
		that.db = param_db;
	});


};

Logger.prototype = {
	_logToDb: function (param_logMessage, param_cb) {
		var that = this;
		if(this.db) {
			this.db.createCollection('suites', function(err, collection) {
				if(!err){
					collection.insert(param_logMessage, {safe:true}, function(err, result){
						that.openLogSaves--;
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
		} else { //db connection is not open yet
			var that = this;
			//insert pending, wait 100ms and try again
			setTimeout(function(){
				console.log('db not ready, waiting 100ms');
				that._logToDb(param_logMessage, param_cb);
			}, 100);
		}
	},
	_logToConsole: function (param_logMessage) {
		console.log(param_logMessage);
	},
	log: function (param_logMessage, param_cb) {
		this.openLogSaves++;
		if (!this.consoleOutput) {
			this._logToDb(param_logMessage, param_cb);
		} else {
			this._logToConsole(param_logMessage);
		}
	},
	get: function (param_uuid, param_cb) {
		//returns all results associated with the uuid parameter
		if(this.openLogSaves === 0) {
			this.db.collection('suites', function(err, collection){
				if(err) {
					param_cb(err,null);
				}
				var cursor = collection.find({uuid:param_uuid});
				var results = [];
				cursor.each(function(err,doc){
					if(doc) {
						if(doc.timeoutOccured) {

						} else {
							results.push(doc);
						}
					} else {
						param_cb(err,results);
					}
				});
				/*cursor.each(function(err, result){
					param_cb(err,result);
				});*/
			});
		} else {
			var that = this;
			//insert pending, wait 100ms and try again
			setTimeout(function(){
				that.get(param_uuid, param_cb);
			}, 100);
		}
	},
	close: function () {
		if(this.db && this.openLogSaves===0) {
			this.db.close();
		} else {
			var that = this;
			setTimeout(function(){
				that.close();
			},100);
		}
	},
	setLogTarget: function (param_setLogTarget) {
		if(param_setLogTarget === 'console') {
			this.consoleOutput = true;
		}
	}
};