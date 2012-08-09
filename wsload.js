/**
 * Module dependencies
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Logger = require('./lib/Logger.js');
var worker = cluster.worker;
var events = require('events');
var util = require('util');

/**
 * Expose `Wsload`
 */

module.exports = Wsload;

/**
 * Initialize a new Wsload object
 * 
 * @param {Object} param_settings
 * @api public
 */

function Wsload (param_settings) {
	events.EventEmitter.call(this);

	if(cluster.isMaster) {
		if(!this.uuid) {
			this.uuid = this._generateUuid();	
		};
		if (param_settings) {
			this.logTarget = param_settings.logTarget;
			if(param_settings.uuid) {
				this.uuid = param_settings.uuid;
			};
		};
	};
};

/**
 * Inherits from `events.EvenEmitter`
 */

util.inherits(Wsload,events.EventEmitter);

/**
 * generates a pseudo random uuid
 *
 * @return {String} uuid
 * @api private
 */

Wsload.prototype._generateUuid = function () {
	//random uuid generator from https://gist.github.com/1308368
	if (cluster.isMaster) { //only the master process is allowed to change the uuid
		var uuid = function uuidGenerator(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
		return uuid();
	} 
};

/**
 * runs all suites
 *
 * @param {String} param_suiteName
 * @param {Integer} param_timesToRunSuite
 * @param {Array} param_testFunction
 * @param {Integer} param_suiteTimeout
 * @param {Object} param_globalUserVar
 * @api public
 */

Wsload.prototype.runSuite = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar) {
	var workerCount = 0;
	var that = this;

	if (numCPUs>param_timesToRunSuite) {
		//there are more cores than tests to run
		workerCount = param_timesToRunSuite;
	} else {
		workerCount = numCPUs;
	};

	if (cluster.isMaster) {
		// Fork workers.
		for (var i = 0; i < workerCount; i++) {
			var worker = cluster.fork({uuid:this.uuid, workerCount:workerCount, workerId:i, logTarget:this.logTarget});
			worker.on('message', function (event) {
				that.emit(event.type, event.msg)
			});
		};
		
		cluster.on('exit', function (worker, code, signal) {
			if (!--workerCount) {
				that._tearDown();
			}
		});
	} else {
		//calculate 
		this._spawnWorker(param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar);
	};
};

/**
 * emit "finished" event, this gets called when all tests are completed
 *
 * @api private
 */

Wsload.prototype._tearDown = function () {
	this._computeResult();
	this.emit('finished');
};

/**
 * Spawns a Worker with help of the Cluster module
 *
 * @param {String} param_suiteName
 * @param {Integer} param_timesToRunSuite
 * @param {Array} param_testFunction
 * @param {Integer} param_suiteTimeout
 * @param {Object} param_globalUserVar
 * @api private
 */

Wsload.prototype._spawnWorker = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar) {
	//result array
	var results = [];

	//run on the cluster
	var Testsuite = require('./lib/Testsuite.js');
	

	//parse Parameter
	this.uuid = process.env.uuid;
	var workerId = parseInt(process.env.workerId);
	var timesToRunSuite = parseInt(param_timesToRunSuite);
	var workerCount = parseInt(process.env.workerCount);

	//calculate Testsuite start# for this worker, check github issue#2
	var start = (workerId * timesToRunSuite)/workerCount;
	start = Math.round(start);

	//calculate Testsuite stop# for this worker, check github issue#2
	var stop = (((workerId+1) * timesToRunSuite)/workerCount) - 1;
	stop = Math.round(stop);
	//DEBUG Print: console.log('id: ' + process.env.workerId + ', start: ' + Math.round(start) + ', stop: ' + Math.round(stop));

	//keep track of finished suites
	var suitesFinished = start;
	var suitesCreated = start;

	//times to run suite per core
	var timesToRunSuitePerCore = stop-start+1;

	//create suites
	var suites = [];
	while (timesToRunSuitePerCore--) {
		suites.push(new Testsuite(this.uuid, suitesCreated++, param_suiteName, param_suiteTimeout, param_testFunctions, param_preTestFunction, param_globalVar));
	}

	var that = this;
	//add listeners
	suites.forEach (function (testsuite) {
		testsuite.on('finished', function (result) {
			results.push(result);
			suitesFinished++;
			if(suitesFinished === suitesCreated) {
				//we are done with this Worker, send 
				var logger = new Logger({logTarget:process.env.logTarget});
				logger.log(results, function (err) {
					if(err) throw new Error(err);
					logger.closeDb();
					var clusterInstance = cluster.worker;
					clusterInstance.destroy();
				});
				
			};
		});

		testsuite.on('timeout', function (suite, test) {
			var msgString = 'Testsuite ' + param_suiteName + '#' + suite + ' timed out in testcase ' + test;
			process.send({
				type:'timeout', 
				msg: msgString
			});
		});
	});
	
	//run suites
	suites.forEach(function(testsuite){
		testsuite.run();
	});
};

/**
 * Calculates a simple result interpretation
 *
 * TODO:
 *   WORK IN PROGRESS, needs testing and functionality. 
 *
 * @api private
 */

Wsload.prototype._computeResult = function () {
	//calculate statistics etc. here
	console.log('calculating results for ' + this.uuid);
	var suiteResults;

	var logger = new Logger();
	logger.get(this.uuid, function (err, resultArray) {
		if(err) console.log('err: ' + err);
		suiteResults = resultArray;
		logger.closeDb();
		suiteResults.forEach(function(element){
			if (element.timeoutOccured) {
				//check which test timed out
				/*element.forEach(function(testfunctionResult) {
					if (testfunctionResult.runDurationInMs==null) {
						console.log('i timed out: ' + testfunctionResult.testname); //this test timed out
					}
				});*/
				//suiteRunInMs = element.timeout;
				//lowestSuiteDuration = element.timeout;
				//highestSuiteDuration = element.timeout;
				return;
			}
			if (lowestSuiteDuration>element.runDurationInMs || lowestSuiteDuration === 0) {
				lowestSuiteDuration = element.runDurationInMs;
			}
			if (highestSuiteDuration<element.runDurationInMs) {
				highestSuiteDuration = element.runDurationInMs;
			}
			suiteRunInMs = suiteRunInMs + element.runDurationInMs;
		});
		
		console.log('average suite duration: ' + suiteRunInMs/suiteResults.length + ' ms');
		console.log('min suite duration: ' + lowestSuiteDuration + ' ms');
		console.log('max suite duration: ' + highestSuiteDuration + ' ms');
	});

	console.log('==========RESULT OVERVIEW==========');
	var suiteRunInMs = 0;
	var lowestSuiteDuration = 0;
	var highestSuiteDuration = 0;
};