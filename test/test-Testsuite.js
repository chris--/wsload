var Testsuite = require('../lib/Testsuite.js');
var http = require('http');

var pretest = function(cb){
	cb(null);
}

var test1 = function test1 (input, cb, global) {			//im timing out
	setTimeout(function(){
		cb(null,'outputTest1');
	},1000);
}
test1.timeout = 20;

var test2 = function test2 (input, cb, global) {			//im fine
	setTimeout(function(){
		//console.log('test2, output von test1: ' + input);
		cb(null,'outputTest2');
	},80);
}
test2.timeout = 200;

var test3 = function getRequest (param,cb) {			//im slow on concurrency
	var options = {
	  host: 'christianvogt.de',
	  path: '/',
	  port: '80',
	  method: 'GET'
	};
	http.request(options, function(res){cb();}).end();
};
test3.timeout = 500000;

var test4 = function fastTest (param,cb) {
	cb();
}


//param_testRunGuid, param_suiteNumber, param_suiteName, param_suiteTimeout, param_suiteFunctions, param_preTestFunction, param_globalUserVar){
var testsuite1 = new Testsuite('dasda', 1,'testSuite1', 1000, [test1], null, 'globaltest'); //test timeout
var testsuite2 = new Testsuite('dasda2', 2,'testSuite2', 1000, [test2], null, 'globaltest'); //im fine
var testsuite3 = new Testsuite('dasda3', 3,'testSuite3', 100, [test2, test2], null, 'globaltest'); //suite timeout
var testsuite4 = new Testsuite('dasda4', 1,'testSuite4', 100, [test4], null, 'globaltest'); //suite timeout

testsuite1.on('finish', function(result){
	console.log('fail1');
})

testsuite1.on('timeout', function(suite, test){
	if( suite==1 && test==1 ) {
		console.log('check1');
	}
})

testsuite2.on('finished', function(result){
	console.log('check2');
});

testsuite2.on('timeout', function(suite, test){
	console.log('fail2');
});

testsuite3.on('finished', function(result){
	console.log('fail3');
});

testsuite3.on('timeout', function(suite, test){
	console.log('check3');
});

testsuite4.on('finished', function(result){
	console.log('check4');
});

testsuite4.on('timeout', function(suite, test){
	console.log('fail4');
});

testsuite1.run();
testsuite2.run();
testsuite3.run();
testsuite4.run();