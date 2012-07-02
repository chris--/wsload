var wsload = require('../wsload.js');
var http = require('http');

var preTestFunc = function preTestFunc (cb){
	//console.log('pretestCode running');
	setTimeout(cb,0);
}

var testcase1 = function doMeAFavor (cb) {
	param1 = 'im testcase 1';
	setTimeout(function (){
		cb(param1);
	},1); //wait 100 ms, then execute cb
}
testcase1.timeout = 200;


var testcase2 = function doMeAFavor2 (cb,param) {
	if (param === 'im testcase 1') {
		console.log('testcase2 : super');
	}
	setTimeout(function(){
		cb('test aus case 2');
	},1); //wait 200 ms and execute cb
}
testcase2.timeout = 400;

var testcase3 = function getRequest (cb) {
	var options = {
	  host: 'christianvogt.de',
	  path: '/',
	  port: '80',
	  method: 'GET'
	};
	http.request(options, function(res){cb();}).end();
};
//testcase3.timeout = 4500;


wsload.runSuite('superSuiteName', 6000, [testcase1, testcase2, testcase3], preTestFunc, 20000, function(err,result){console.log('wtf' + result)});
