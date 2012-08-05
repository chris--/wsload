module.exports = {
	setUp : function (callback) {
		this.Testcase = require('../../lib/Testcase.js');
		this.testfunction = function (input_param, cb, global) {
			setTimeout(function () { //finishes after 100ms
				cb(null, 'testfunction finished');
			},100); 
		};
		this.testfunction.timeout = 150;
		this.testcaseInstance = null;
		callback();
	},
	"test create testcase" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			that.testcaseInstance = new that.Testcase(1, that.testfunction, {globalkey:'globalval'});
			test.done();
		});
	},
	"test run testcase, set run duration and get result" : function (test) {
		var that = this;
		var util = require('util');
		test.doesNotThrow ( function() {
			that.testcaseInstance = new that.Testcase(1, that.testfunction, {globalkey:'globalval'});
			that.testcaseInstance.runTest('inputVal', function (err,result) {
				test.equal(err, null);
				test.equal(result, 'testfunction finished');
				that.testcaseInstance.setRunDuration(100);
			
				var result = that.testcaseInstance.getResult();
				test.equal(result.testnr, 1);
				test.equal(result.inputValue, util.inspect('inputVal'));
				test.equal(result.outputValue, util.inspect('testfunction finished'));
				test.ok(result.runDurationInMs>99);
				test.ok(result.runDurationInMs<110);
				test.equal(result.timeout, that.testfunction.timeout);
				test.done();
			});

		});
	}
};