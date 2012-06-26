var runSingleTestsuite = require('./runSingleTestsuite.js');


var preTestFunc = function preTestFunc (cb){
	//console.log('pretestCode running');
	setTimeout(cb,20);
}


var testcase1 = function doMeAFavor (cb) {
	param1 = 'im testcase 1';
	setTimeout(function (){
		cb(param1);
	},100); //wait 100 ms, then execute cb
}
testcase1.timeout = 110;


var testcase2 = function doMeAFavor2 (cb,param) {
	if (param === 'im testcase 1') {
		console.log('testcase2 : super');
	}
	setTimeout(function(){
		cb('test aus case 2');
	},200); //wait 200 ms and execute cb
}
testcase2.timeout = 400;


//var r1 = new runSingleTestsuite();
runSingleTestsuite.run(0, 'suitename123', 1000, [testcase1,testcase2], preTestFunc, function(err,result){if(err){console.log('error: ' + err)}});
runSingleTestsuite.run(1, 'suitename3', 1000, [testcase2,testcase1], preTestFunc, function(err,result){if(err){console.log('error: ' + err)}});