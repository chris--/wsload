var Testsuite = require('../lib/Testsuite.js');
var http = require('http');

var pretest = function(cb){
	cb(null);
}

var test1 = function test1 (input, cb, global) {
	setTimeout(function(){
		cb(null,'outputTest1');
	},10);
}
test1.timeout = 20;

var test2 = function test2 (input, cb, global) {
	setTimeout(function(){
		//console.log('test2, output von test1: ' + input);
		cb(null,'outputTest2');
	},80);
}
test2.timeout = 100;

var testcase3 = function getRequest (param,cb) {
	var options = {
	  host: 'christianvogt.de',
	  path: '/',
	  port: '80',
	  method: 'GET'
	};
	http.request(options, function(res){cb();}).end();
};
testcase3.timeout = 500000;



//param_suiteNumber, param_suiteName, param_suiteTimeout, param_suiteFunctions, param_preTestFunction, param_globalUserVar
var testsuite = new Testsuite(1,'testSuite', 1000, [testcase3], pretest, 'globaltest');
var testsuite2 = new Testsuite(2,'testSuite2', 1000, [test2], null, 'globaltest');

testsuite.run();
testsuite2.run();

testsuite2.on('finished', function(result){
	console.log(result);
});

testsuite2.on('timeout', function(suite, test){
	console.log('suite #' + suite + ' timed out in test ' + test);
});

