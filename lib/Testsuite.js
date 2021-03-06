/**
 * Module dependencies
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

/** 
 * Expose `Testsuite`
 */

module.exports = Testsuite;

/**
 * Initialize a new `Testsuite`.
 *
 * A Testsuite encapsulates a number of `Testcase` that need to be run in order.
 * 
 * @constructor
 * @param {String} param_testRunGuid
 * @param {Integer} param_suiteNumber
 * @param {String} param_suiteName
 * @param {Integer} param_suiteTimeout
 * @param {Array} param_suiteFunctions
 * @param {Function} param_preTestFunction
 * @param {Object} param_globalUserVar
 * @api public
 */

function Testsuite (param_testRunGuid, param_suiteNumber, param_suiteName, param_suiteTimeout, param_suiteFunctions, param_preTestFunction, param_globalUserVar){
	//constructor
	var Testcase = require('./Testcase.js');
	this.globalUserVar = param_globalUserVar;

	//create initial result object
	this.suiteResult = {}; //Object for the results
	this.suiteResult.uuid = param_testRunGuid;
	this.suiteResult.suiteNumber = param_suiteNumber; //run # of the testsuite
	this.suiteResult.suiteName = param_suiteName; //name of the testsuite
	this.suiteResult.createdOn = new Date();
	this.suiteResult.runDurationInMs = 0; //sum of all testcase run durations
	this.suiteResult.timeoutInMs = param_suiteTimeout; // if runDurationInMs>this -> suite timeout
	this.suiteResult.timeoutOccured = false; //set to true if suite timeout or test timeout
	this.suiteResult.testcases = []; //save test results here


	//add initial testcases
	this.testcases = [];
	var that = this;
	var i = 0;
	param_suiteFunctions.forEach(function (single_testfunction) {
		that.addTestcase(new Testcase(i++, single_testfunction, that.globalUserVar));
	});

	//check for preTest function, if function is specified, override default
	if(param_preTestFunction) {
		this.preTestFunction = param_preTestFunction; //function to run before every test
	};

};

/**
 * preTestFunction is run before every testcase. can be overridden by user function
 *
 * @param {Function} cb
 * @api public
 */

 Testsuite.prototype.preTestFunction = function (cb) {
 	cb();
 };


/**
 * Adds a new Testcase to the Testsuite
 * 
 * @param {Testcase} param_testcase
 * @api public
 */

Testsuite.prototype.addTestcase = function (param_testcase) {
	this.testcases.push(param_testcase);
	//_createSuite();
};


/**
 * Runs this Testsuite
 * 
 * @api public
 */

Testsuite.prototype.run = function () {
	var Measure = require('./Measure.js');
	var that = this;

	if(this.testcases[0] && !this.suiteResult.timeoutOccured) { //are there functions to run and no suite timeout?

		this.preTestFunction(function(err){
			
			var currentTest = that.testcases[0];
			var nextTest = that.testcases[1];

			//init measurement and callback
			var measure = new Measure(currentTest.timeout, function (err,timeInMs) {
				//measure stop callback
				that.addResult(currentTest, timeInMs);
				//delete this testcase
				that.testcases.shift();
				//run next test
				that.run();
			});

			//run test on next tick
			process.nextTick(function() {
				//start timer
				measure.start();
				currentTest.runTest(currentTest.inputValue, function (err, param_outputValue){
					currentTest.outputValue = param_outputValue;
					if(nextTest) {
						nextTest.inputValue = param_outputValue;
					}
					if(err) {
						currentTest.errorThrown = err;
					}
					//stop measure, call cb
					measure.stop();
				});
			});

		});
	};

};

/**
 * Adds a runtime result to a test case
 * 
 * @param {Testcase} param_testcase
 * @param {Integer} param_timeInMs
 * @api public
 */

Testsuite.prototype.addResult = function (param_testcase, param_timeInMs) {
	//add run duration to testcase
	param_testcase.setRunDuration(param_timeInMs);

	//sum up Suite run Duration
	if(param_timeInMs) {
		this.suiteResult.runDurationInMs += param_timeInMs;
	} else {
		//test timeout occured
		this.suiteResult.timeoutOccured = true;
	}
	
	//push result to result array
	this.suiteResult.testcases.push(param_testcase.getResult());

	//did a timeout occur?
	this._didTimeoutOccur();

	//is this suite finished?
	this._didTestsuiteFinish();
};


/**
 * Checks whether a timeout occured
 * 
 * @api private
 */

Testsuite.prototype._didTimeoutOccur = function () {
	if (this.suiteResult.runDurationInMs > this.suiteResult.timeoutInMs || this.suiteResult.timeoutOccured) {
		this.suiteResult.timeoutOccured = true;
		this.emit('timeout', this.suiteResult.suiteNumber, this.suiteResult.testcases.length);
	}
	return this.suiteResult.timeoutOccured;
};

/**
 * Checks wheather this test suite finished
 * 
 * @api private 
 */

Testsuite.prototype._didTestsuiteFinish = function () {
	if (this.testcases.length == 1 || this.suiteResult.timeoutOccured) {
		//we are done
		this.emit('finished', this.suiteResult);
	}
};

/**
 * Inherits from `EventEmitter.prototype`
 */

Testsuite.prototype.__proto__ = EventEmitter.prototype;