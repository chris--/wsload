var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Logger = require('./lib/Logger.js');
var worker = cluster.worker;

var Wsload = module.exports = function (param_settings) {
	
	//random uuid generator from https://gist.github.com/1308368
	function uuidGenerator(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
	this.uuid = uuidGenerator();
	if (param_settings) {
		this.logTarget = param_settings.logTarget;
	}

};


Wsload.prototype.runSuite = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar) {
	var workerCount = 0;

	if (numCPUs>param_timesToRunSuite) {
		//there are more cores than tests to run
		workerCount = param_timesToRunSuite;
	} else {
		workerCount = numCPUs;
	}

	if (cluster.isMaster) {
		// Fork workers.
		for (var i = 0; i < workerCount; i++) {
			cluster.fork({uuid:this.uuid, workerCount:workerCount, workerId:i, logTarget:this.logTarget});
		}
		cluster.on('exit', function(worker, code, signal) {
			console.log('worker ' + worker.pid + ' died');
		});
	} else {
		//calculate 
		this._spawnWorker(param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar);
	}

};

Wsload.prototype._spawnWorker = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar) {
	//result array
	var results = [];

	//create logger
	this.logger = new Logger({logTarget:process.env.logTarget});

	//run on the cluster
	var Testsuite = require('./lib/Testsuite.js');
	

	//parse Parameter
	this.uuid = process.env.uuid;
	var workerId = parseInt(process.env.workerId);
	var timesToRunSuite = parseInt(param_timesToRunSuite);
	var workerCount = parseInt(process.env.workerCount);

	//calculate start# for this worker, check github issue#2
	var start = (workerId * timesToRunSuite)/workerCount;
	start = Math.round(start);
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
				that.logger.log(results);
				that._closeDb();
			}
		});

		testsuite.on('timeout', function (suite, test) {
			console.log('suite ' + param_suiteName + '#' + suite + ' timed out in test ' + test);
			suitesFinished++;
		});
	});
	
	//run suites
	suites.forEach(function(testsuite){
		testsuite.run();
	});
};

// Wsload.prototype.computeResult = function () {
// 	//calculate statistics etc. here
// 	console.log('computing ' + this.uuid);
// 	//logger = new Logger();
// 	this.logger.get(this.uuid, function (err, result) {
// 		console.log(result);
// 	});

// 	console.log('==========RESULT OVERVIEW==========');
// 	var suiteRunInMs = 0;
// 	var lowestSuiteDuration = 0;
// 	var highestSuiteDuration = 0;

// 	suiteResults.forEach(function(element){
// 		if (element.timeoutOccured) {
// 			//check which test timed out
// 			element.testsRun.forEach(function(testfunctionResult) {
// 				if (testfunctionResult.runDurationInMs==null) {
// 					console.log('i timed out: ' + testfunctionResult.testname); //this test timed out
// 				}
// 			});
// 			//suiteRunInMs = element.timeout;
// 			//lowestSuiteDuration = element.timeout;
// 			//highestSuiteDuration = element.timeout;
// 			return;
// 		}
// 		if (lowestSuiteDuration>element.runDurationInMs || lowestSuiteDuration === 0) {
// 			lowestSuiteDuration = element.runDurationInMs;
// 		}
// 		if (highestSuiteDuration<element.runDurationInMs) {
// 			highestSuiteDuration = element.runDurationInMs;
// 		}
// 		suiteRunInMs = suiteRunInMs + element.runDurationInMs;
// 	})
	
// 	console.log('average suite duration: ' + suiteRunInMs/suiteResults.length + ' ms');
// 	console.log('min suite duration: ' + lowestSuiteDuration + ' ms');
// 	console.log('max suite duration: ' + highestSuiteDuration + ' ms');
	
// 	cb(null, 'done');
// }

Wsload.prototype._closeDb = function() {
	this.logger.closeDb();
};