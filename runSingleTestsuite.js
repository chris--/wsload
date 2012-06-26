var Measure = require('./Measure.js');
var logger = require('./logResult.js');
var async = require('async');

var runSingleTestsuite = module.exports; //exposed as a module


runSingleTestsuite.run = function(param_suiteNumber, param_suiteName, param_suiteTimeout, param_suiteFunctions, param_preTestFunction, param_cb) {
	var suiteResults = new Array(); //array for the results
	var testFunctions = param_suiteFunctions; //testfunctions to run (in correct order)
	var waterfallFunctions = new Array(); //all functions to run in order
	var suiteTimeoutTimer;
	var completeSuite;
	var timedOut = false;


	function saveResult() {
		//we are done, clear timeout timer
		clearTimeout(suiteTimeoutTimer);

		//did this suite or a test already time out?
		if(timedOut) {
				completeSuite.timeoutOccured = true;
				logger.savePersistent(JSON.stringify(completeSuite));
				param_cb('timeout occured in testsuite ' + completeSuite.suiteName, completeSuite);
		} else {
			logger.savePersistent(JSON.stringify(completeSuite));
			param_cb(null, completeSuite);
		}
	}


	function findCurrentTestFunction () {
		//find next function to run
		var function_nr;
		for (function_nr=0; function_nr<suiteResults.length; function_nr++) {
			if (suiteResults[function_nr].runDurationInMs === null) {
				break;
			}
		}
		return function_nr;
	}


	var testRunner = function(cb) {
		
		if(!timedOut) {
			var returnValue;
			var currentTestFunction = findCurrentTestFunction();
			var measure = new Measure(suiteResults[currentTestFunction].timeout, function(err,result){
				if(err) { //testtimeout occured
					//console.error('testtimeout');
					timedOut = true;
				} else {
					completeSuite.runDurationInMs = completeSuite.runDurationInMs + result;
				}
				var currentTestFunction = findCurrentTestFunction();
				suiteResults[currentTestFunction].runDurationInMs = result;
				cb();
			});
			
			
			measure.start();

			//if the previous testcase returned a value, pass it to the next one
			lastReturnVal = suiteResults[currentTestFunction].lastReturnVal;
			
			//start testfunction and execute measure.stop on callback
			suiteResults[currentTestFunction].testFunction(function(param){
				suiteResults[findCurrentTestFunction()].returnValue = param;
				measure.stop();
			},lastReturnVal);
		} else {
			cb();
		}

	}

	//create inital test-overview and add functions to queue
	for (var currentTest=0; currentTest<testFunctions.length;currentTest++) {
		var singleResult = {	"testnr":currentTest,
								"testname":testFunctions[currentTest].name,
								"testFunction":testFunctions[currentTest],
								"returnValue":"",
								"runDurationInMs":null,
								"timeout":testFunctions[currentTest].timeout};
		suiteResults.push(singleResult);

		waterfallFunctions.push(param_preTestFunction);
		waterfallFunctions.push(testRunner);
	}

	//create inital suite result
	completeSuite = new Object;
	completeSuite.suiteNumber = param_suiteNumber;
	completeSuite.suiteName = param_suiteName;
	completeSuite.runDurationInMs = 0; //i want to be computed later
	completeSuite.timeout = param_suiteTimeout;	
	//start timeout timer
	suiteTimeoutTimer = setTimeout(function(){
		timedOut = true;
	},param_suiteTimeout);
	
	//start testcases
	async.waterfall(waterfallFunctions, function(err,results) {	
		completeSuite.testsRun = suiteResults;
		saveResult();
	});

}



