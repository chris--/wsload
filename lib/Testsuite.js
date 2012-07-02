/**
*	Testsuite.js
*		Represents a Testsuite that runs Testcases in a specific order 
*
*	Constructor:
*		Testsuite(param_timeout)
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
var Measure = require('./Measure.js');
var Logger = require('./Logger.js');
var async = require('async');
var logger = new Logger();

var Testsuite = module.exports = function(param_suiteTimeout){
	this.suiteTimeoutInMs = param_suiteTimeout; //suitetimeout, testcase timeout is in param_suiteFunctions[].timeout
	this.suiteResults = new Array(); //array for the results
};


Testsuite.prototype.run = function(param_suiteNumber, param_suiteName, param_suiteFunctions, param_preTestFunction, param_cb) {
	var testFunctions = param_suiteFunctions; //testfunctions to run (in correct order)
	var waterfallFunctions = new Array(); //all functions to run in array order
	var completeSuite; //holds all the results
	var timedOut = false; //true when suite times out due to suite timeout or testcase timeout
	var that = this; //keep this element for embedded functions

	var startUp = function() {
		//create inital test-overview and add functions to queue
		for (var currentTest=0; currentTest<testFunctions.length;currentTest++) {
			var singleResult = {	"testnr":currentTest,
									"testname":testFunctions[currentTest].name,
									"testFunction":testFunctions[currentTest],
									"returnValue":"",
									"runDurationInMs":null,
									"timeout":testFunctions[currentTest].timeout};
			that.suiteResults.push(singleResult);

			waterfallFunctions.push(param_preTestFunction);
			waterfallFunctions.push(testRunner);
		}

		//create inital suite result
		completeSuite = new Object;
		completeSuite.suiteNumber = param_suiteNumber;
		completeSuite.suiteName = param_suiteName;
		completeSuite.runDurationInMs = 0; //i want to be computed later
		completeSuite.timeout = that.suiteTimeoutInMs;
		
		//start testcases
		async.waterfall(waterfallFunctions, function(err,results) {	
			completeSuite.testsRun = that.suiteResults;
			saveResult();
		});	
	};

	var testRunner = function(cb) {
		//capsulates the testFunction call and measures runDuration of the test. call cb when done
		if(!timedOut) {
			var returnValue;
			var currentTestFunction = findCurrentTestFunction();
			var measure = new Measure(that.suiteResults[currentTestFunction].timeout, function(err,result){
				if(err) { //testtimeout occured
					//console.error('testtimeout');
					timedOut = true;
				} else {
					completeSuite.runDurationInMs = completeSuite.runDurationInMs + result;
				}

				//check whether the suite timeout is reached
				if(completeSuite.runDurationInMs>this.suiteTimeoutInMs) {
					timedOut = true;
				}

				var currentTestFunction = findCurrentTestFunction();
				that.suiteResults[currentTestFunction].runDurationInMs = result;
				cb();
			});
			
			measure.start();

			//if the previous testcase returned a value, pass it to the next one
			lastReturnVal = that.suiteResults[currentTestFunction].lastReturnVal;
			
			//start testfunction and execute measure.stop on callback
			that.suiteResults[currentTestFunction].testFunction(function(param){
				that.suiteResults[findCurrentTestFunction()].returnValue = param;
				measure.stop();
			},lastReturnVal);
		} else {
			cb();
		}

	};

	function saveResult() {
		logger.log(JSON.stringify(completeSuite));
		//did this suite or a test already time out?
		if(timedOut) {
				completeSuite.timeoutOccured = true;
				param_cb('timeout occured in testsuite ' + completeSuite.suiteName + ' nr ' + completeSuite.suiteNumber, completeSuite);
		} else {
			param_cb(null, completeSuite);
		}
		
	};


	function findCurrentTestFunction () {
		//find next function to run
		var function_nr;
		for (function_nr=0; function_nr<that.suiteResults.length; function_nr++) {
			if (that.suiteResults[function_nr].runDurationInMs === null) {
				break;
			}
		}
		return function_nr;
	};

	startUp();
	

}



