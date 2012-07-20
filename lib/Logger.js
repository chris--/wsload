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
	
	if(param_settings) {
		if (param_settings.logTarget === 'console') {
			this.consoleOutput = true;
		} else {
			this.consoleOutput = false;
		}	
	}
	this.openLogSaves = 0;
	this.db = null;

	if(!this.consoleOutput) {
		this.openDb();
	}



};

Logger.prototype = {
	_logToDb: function (param_logMessage, param_cb) {
		var that = this;
		if(this.db) {
			console.log('log: ' + param_logMessage);
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
			//insert pending, wait 500ms and try again, if db not up -> log to console
			var dbTimeout = setTimeout(function () {
				if(!that.db) {
					that.consoleOutput = true;
				} else {
					console.log('waited 500');
					that._reLog(param_logMessage, param_cb);
				}
			}, 500);
		}
	},
	_logToConsole: function (param_logMessage) {
		console.log(param_logMessage);
	},
	log: function (param_logMessage, param_cb) {
		this.openLogSaves++;
		this._reLog(param_logMessage, param_cb);
	},
	_reLog : function (param_logMessage, param_cb) {
		if (!this.consoleOutput) {
			this._logToDb(param_logMessage, param_cb);
		} else {
			this._logToConsole(param_logMessage);
		}
	},
	get: function (param_uuid, param_cb) {
		//returns all results associated with the uuid parameter

		if (this.db && this.openLogSaves === 0) {
			this.db.collection('suites', function(err, collection){
				if(err) {
					param_cb(err,null);
				} else {
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
				}
			});
		} else if (this.consoleOutput) {
			param_cb('no database connection');
		}
		else {
			this.openDb();
			var that = this;
			console.log('insert pending');
			//insert pending, wait 100ms and try again
			setTimeout(function(){
				that.get(param_uuid, param_cb);
			}, 100);
		}
	},
	openDb: function () {
		//open database
		var that = this;
		MongoAdapter.getInstance(function(err,param_db){
			if(err) {
				console.log('could not open database, using console');
				that.consoleOutput = true;
			}
			that.db = param_db;
		});
	},
	closeDb: function () {
		//console.log(this.openLogSaves);
		if(this.db && this.openLogSaves===0) {
			this.db.close();
		} else { //wait for logsaves to finish
			var that = this;
			setTimeout(function(){
				that.closeDb();
			},500);
		}
	}
};