/*
*	Logger.js
*		Logs a result to a persistent storage or to console.
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
*
*/

/**
 * Module dependencies
 */

var MongoAdapter = require('./MongoAdapter.js');
var util = require('util');


/** 
 * Expose `Logger`
 */

module.exports = Logger;

/**
 * Initialize a new `Logger`
 *
 * The Logger logs results from the testruns to a db or, if not reachable, to the console
 *
 * @param {Object} param_settings
 * @api private
 */

function Logger (param_settings) {
	if(param_settings) {
		if (param_settings.logTarget === 'console') {
			this.consoleOutput = true;
		} else {
			this.consoleOutput = false;
		};
	};
	this.openLogSaves = 0;
	this.db = null;
	this.openDb();
};

/**
 * Logs a message to the db
 *
 * @param {Object} param_logMessage
 * @param {Function} param_cb
 * @api private
 */

Logger.prototype._logToDb = function (param_logMessage, param_cb) {
	var that = this;
	
	if(this.db) {
		this.db.createCollection('suites', function(err, collection) {
			if (err && param_cb) {
				param_cb(err,null);
				return;
			};
			
			collection.insert(param_logMessage, {safe:true}, function(err, result) {
				that.openLogSaves--;
				if(!err) {
					if (param_cb) {
						param_cb(null, result);
					};
				} else {
					if (param_cb) {
						param_cb(err, null);
					};
				};
			});
		});
	} else { //db connection is not open yet
		var that = this;
		//insert pending, wait 500ms and try again, if db not up -> log to console
		var dbTimeout = setTimeout(function () {
			if(!that.db) {
				console.log('waited 1000 ms, using console');
				that.consoleOutput = true;
				that._reLog(param_logMessage, param_cb);
			} else {
				//try to log to db again
				that._reLog(param_logMessage, param_cb);
			};
		}, 1000);
	}
};

/**
 * Logs a message to the console
 *
 * @param {Object} param_logMessage
 * @api private
 */

Logger.prototype._logToConsole = function (param_logMessage) {
	console.log(util.inspect(param_logMessage, showHidden=false, depth=3));
};

/**
 * Logs a message to the db without incrementing the openLogSaves counter
 *
 * @param {Object} param_logMessage
 * @param {Function} param_cb
 * @api private
 */

Logger.prototype._reLog = function (param_logMessage, param_cb) {
	if (!this.consoleOutput) {
		this._logToDb(param_logMessage, param_cb);
	} else {
		this._logToConsole(param_logMessage);
	}
};

/**
 * Logs a message
 *
 * @param {Object} param_logMessage
 * @param {Function} param_cb
 * @api public
 */

Logger.prototype.log = function (param_logMessage, param_cb) {
	this.openLogSaves++;
	this._reLog(param_logMessage, param_cb);
};

/**
 * Gets results from database with given uuid
 *
 * @param {Integer} param_uuid
 * @param {Function} param_cb
 * @api public
 */
Logger.prototype.get = function (param_uuid, param_cb) {
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
			};
		});
	} else if (this.consoleOutput) {
		param_cb('no database connection');
	}
	else {
		this.openDb();
		var that = this;
		//console.log('insert pending');
		setTimeout(function(){ //insert pending, wait 100ms and try again
			that.get(param_uuid, param_cb);
		}, 100);
	}
};

/**
 * open the db from the adapter
 *
 * @api public
 */
Logger.prototype.openDb = function () {
	//open database
	var that = this;
	if (!this.db) {
		this.adapter = new MongoAdapter(function(err,param_db){
			if(err) {
				console.log('could not open database, using console');
				that.consoleOutput = true;
				that.db = false;
			}
			that.db = param_db;
		});
	};
};

/**
 * closes the db with help of the adapter
 *
 * @api public
 */
Logger.prototype.closeDb = function () {
	var that = this;
	if (this.consoleOutput) {
		return;
	} else if (this.openLogSaves !== 0) { //wait for logsaves to finish
		console.log('delaying close db, log saves pending');
		setTimeout(function(){
			that.closeDb();
		},500);
	} else { 
		this.db = false;
		this.adapter.close(true);
	};
};