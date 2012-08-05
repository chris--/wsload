module.exports = {
	setUp : function (callback) {
		this.Testsuite = require('../../lib/Testsuite.js');
		callback();
	},
	"test create Testsuite and add 1 case" : function (test) {
		var that = this;
		var testFunction = function (input,cb,global){ cb(); }
		test.doesNotThrow ( function() {
			var testSuiteInstance = new that.Testsuite('unit-test-guid', 1, 'unit test suite', 100, [testFunction], null, {globalkey: 'globalval'});
			test.done();
		});
	},
	"test create testcase and run Suite" : function (test) {
		var that = this;
		var testFunction = function (input,cb,global){ cb(); }
		test.doesNotThrow ( function() {
			var testSuiteInstance = new that.Testsuite('unit-test-guid', 1, 'unit test suite', 100, [testFunction], null, {globalkey: 'globalval'});
			testSuiteInstance.run();
			testSuiteInstance.on('finished', function (result) {
				test.notEqual(result, null);
				test.equal(result.suiteNumber, 1);
				test.equal(result.suiteName, 'unit test suite');
				test.notEqual(result.runDurationInMs, 'undefined');
				test.ok(result.runDurationInMs>0);
				test.ok(result.runDurationInMs<10);
				test.equal(result.timeoutOccured, false);
				test.notEqual(result.testcases, null);
				test.done();
			});
		});
	},
	"test create 4 testcases and run Suite" : function (test) {
		var that = this;
		var testFunctionArray = returnsTestcasesAsArray();
		test.doesNotThrow ( function() {
			var testSuiteInstance = new that.Testsuite('unit-test-guid', 1, 'unit test suite', 1000, testFunctionArray, null, {globalkey: 'globalval'});
			testSuiteInstance.run();
			testSuiteInstance.on('finished', function (result) {
				test.notEqual(result, null);
				test.equal(result.suiteNumber, 1);
				test.equal(result.suiteName, 'unit test suite');
				test.notEqual(result.runDurationInMs, 'undefined');
				test.ok(result.runDurationInMs>0);
				test.ok(result.runDurationInMs<1000);
				test.equal(result.timeoutOccured, false);
				test.notEqual(result.testcases, null);
				test.done();
			});
		});
	},
	"test suite times out" : function (test) {
		var that = this;
		var testFunction = function (input,cb,global){} //this function never ends
		test.doesNotThrow ( function() {
			var testSuiteInstance = new that.Testsuite('unit-test-guid', 1, 'unit test suite', 100, [testFunction], null, {globalkey: 'globalval'});
			testSuiteInstance.run();
			testSuiteInstance.on('timeout', function (suite,testcase) {
				test.done();
			});
		});
	},
	"testcase times out" : function (test) {
		var that = this;
		var testFunction = function (input,cb,global){} //this function never ends
		testFunction.timeout = 10;
		test.doesNotThrow ( function() {
			var testSuiteInstance = new that.Testsuite('unit-test-guid', 1, 'unit test suite', 100, [testFunction], null, {globalkey: 'globalval'});
			testSuiteInstance.run();
			testSuiteInstance.on('timeout', function (suite,testcase) {
				test.done();
			});
		});
	}
};



function returnsTestcasesAsArray () {
	var test1 = function test1 (input, cb, global) {			//im timing out
		setTimeout(function(){
			cb(null,'outputTest1');
		},10);
	}
	test1.timeout = 200;

	var test2 = function test2 (input, cb, global) {			//im fine
		setTimeout(function(){
			//console.log('test2, output von test1: ' + input);
			cb(null,'outputTest2');
		},80);
	}
	test2.timeout = 200;

	var test3 = function getRequest (param,cb) {			//im slow on concurrency
		var http = require('http');
		var options = {
		  host: 'christianvogt.de',
		  path: '/',
		  port: '80',
		  method: 'GET'
		};
		http.request(options, function(res){cb();}).end();
	};
	test3.timeout = 500;

	var test4 = function fastTest (param,cb) {
		cb();
	};
	test4.timeout = 10;

	var testcases = [];
	testcases.push(test1);
	testcases.push(test2);
	testcases.push(test3);
	testcases.push(test4);

	return testcases;
};