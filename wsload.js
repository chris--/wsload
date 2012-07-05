var cluster = require('cluster');
var numCPUs = require('os').cpus().length;


var Wsload = module.exports = function () {
	var Logger = require('./lib/Logger.js');

	//random uuid generator from https://gist.github.com/1308368
	function uuidGenerator(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
	this.uuid = uuidGenerator();

	//create logger
	this.logger = new Logger();
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
			cluster.fork({uuid:this.uuid, workerCount:workerCount});
		}
		cluster.on('exit', function(worker, code, signal) {
			console.log('worker ' + worker.pid + ' died');
		});
	} else {
		this._spawnWorker(param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar);
	}

};

Wsload.prototype._spawnWorker = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_globalVar) {
	//run on the cluster
	var Testsuite = require('./lib/Testsuite.js');
	
	//keep track of finished suites
	var suitesFinished = 0;
	var suitesCreated = 0;

	//times to run suite per core
	var timesToRunSuitePerCore = Math.floor(param_timesToRunSuite/process.env.workerCount);

	//create suites
	var suites = [];
	while (timesToRunSuitePerCore--) {
		suites.push(new Testsuite(process.env.uuid, suitesCreated++, param_suiteName, param_suiteTimeout, param_testFunctions, param_preTestFunction, param_globalVar));
	}

	var that = this;
	//add listeners
	suites.forEach (function (testsuite) {
		testsuite.on('finished', function (result) {
			that.logger.log(result);
			suitesFinished++;
			if(suitesFinished === suitesCreated) {
				//param_cb(null,'done');
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

Wsload.prototype.close = function() {
	this.logger.close();
}