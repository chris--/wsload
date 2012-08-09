/*!
*	Testcase.js
*		Wrapper for the actual Testfunction
*
*	Constructor:
*		Testsuite(param_testNr, param_testFunction, param_globalUserVar)
*	public Methods:
*		runTest()
*		setRunDuration()
*		getResult()
*
*
*	Usage: @todo
*/


/**
 * Module dependencies
 */

var util = require('util');

/** 
 * Expose `Testcase`
 */

module.exports = Testcase;

/**
 * Initialize a new `Testcase`
 *
 * A "Testcase" encapsulates the actual test function
 *
 * @constructor
 * @param {Integer} param_testNr
 * @param {Function} param_testFunction
 * @param {Object} param_globarlUserVar
 * @api public
 */

function Testcase (param_testNr, param_testFunction, param_globalUserVar) {
	this.testnr = param_testNr; //testnr in this suite
	if(typeof param_testFunction === 'function' ) {
		this.testFunction = param_testFunction;  //testfunction
	} else {
		throw Error('Testcase: Testfunction is not a JS function');
	}
	this.testname = param_testFunction.name; //testname
	this.outputValue = null; //return value of the testFunction
	this.inputValue = null; //set by previous test
	this.runDurationInMs = null; //set by testsuite, actual runtime of this testFunction
	this.testFunction = param_testFunction; //actual testfunction
	this.startDate = null;
	
	if (param_testFunction.timeout) {
		this.timeout = param_testFunction.timeout; //test timeout if set
	}
	
	this.globalUserVar = param_globalUserVar;
};

/**
 * Run the test function with a given input parameter
 *
 * @param {Object} param_inputValue
 * @param {Function} param_cb
 * @api public
 */

Testcase.prototype.runTest = function (param_inputValue, param_cb) {
	this.startDate = new Date();
	this.inputValue = param_inputValue;
	var that = this;
	this.testFunction(param_inputValue, function(err,result){
		that.outputValue = result;
		param_cb(err,result);
	}, this.globalUserVar);
};

/**
 * Sets the result from a time measurement for this test case (unit:milliseconds)
 *
 * @param {Integer} param_runDuration
 * @api public
 */

Testcase.prototype.setRunDuration = function (param_runDuration) {
	this.runDurationInMs = param_runDuration;
};

/**
 * Returns the test case result
 * 
 * @returns {Object} result
 * @api public
 */

Testcase.prototype.getResult = function () {
	var that = this;
	var result = {
		testnr: that.testnr,
		inputValue: util.inspect(that.inputValue),
		outputValue: util.inspect(that.outputValue),
		runDurationInMs: that.runDurationInMs,
		startDate: that.startDate,
		timeout: that.timeout
	};
	return result;
};