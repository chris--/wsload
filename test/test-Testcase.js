var Testcase = require('../lib/Testcase.js');

//actual testcase function							
var testfunc = function(input_param,cb,global) {
	console.log('testfunc start');
	console.log('inputParam: ' + input_param);
	setTimeout(function(){
		console.log('testfunc stop');
		cb(null,'outputVal');
	},10);
}


// constructor               param_testNr, param_testName, param_testFunction, param_userVar
var testcase = new Testcase(1, testfunc, 100, null);

testcase.runTest('inputVal', function(err,result){
	console.log('output val from testfunc: ' + result);
});