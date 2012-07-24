/* Testcase.js
*
*/
var util = require('util');

var Testcase = module.exports = function (param_testNr, param_testFunction, param_globalUserVar) {
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


Testcase.prototype.runTest = function (param_inputValue, param_cb) {
	this.startDate = new Date();
	var that = this;
	this.testFunction(param_inputValue, function(err,result){
		that.outputValue = result;
		param_cb(err,result);
	}, this.globalUserVar);
};

Testcase.prototype.setRunDuration = function (param_runDuration) {
	this.runDurationInMs = param_runDuration;
};

Testcase.prototype.getResult = function () {
	var that = this;
	var result = {
		testnr: that.testnr,
		inputValue: util.inspect(that.inputValue),
		outputValue: util.inspect(that.outputValue),
		runDurationInMs: that.runDurationInMs,
		startDate: that.startDate
	};
	return result;
};