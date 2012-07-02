/* Testcase.js
*
*/


var Testcase = module.exports = function(param_testNr, param_testFunction, param_globalUserVar) {
	this.testnr = param_testNr; //testnr in this suite
	if(typeof param_testFunction === 'function' ) {
		this.testFunction = param_testFunction;  //testfunction
	} else {
		throw Error('Testcase: Testfunction is not a JS function');
	}
	this.testname = param_testFunction.name; //testname
	this.outputValue = null; //return value of the testFunction
	this.inputValue = null; //set by previous test
	this.runDurationInMs = null //set by testsuite, actual runtime of this testFunction
	this.testFunction = param_testFunction; //actual testfunction
	
	if (param_testFunction.timeout) {
		this.timeout = param_testFunction.timeout; //test timeout if set
	}
	
	this.globalUserVar = param_globalUserVar;
}


Testcase.prototype.runTest = function(param_inputValue, param_cb) {
	var that = this;
	this.testFunction(param_inputValue, function(err,result){
		that.outputValue = result;
		param_cb(err,result);
	}, this.globalUserVar);
}

Testcase.prototype.setRunDuration = function(param_runDuration) {
	this.runDurationInMs = param_runDuration;
}