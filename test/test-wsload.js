var Wsload = require('../wsload.js');

var preTestFunc = function preTestFunc (cb){
	var randomnumber=Math.floor(Math.random()*101); //wait 1-100 ms
	setTimeout(cb,randomnumber);
}

var testcase1 = function add (param, cb, global) {
	var i = 1;
	var j = 2;
	var k = i+j;
	cb(null, k); //set k as output value
}
testcase1.timeout = 150; //set timeout to 15ms


var testcase2 = function subtract (param, cb, global) {
	var i = param; 	//matches k from testcase1 (=3)
	var j = i-1;
	console.log('test2: j=' + j);	//j=2
	cb(null, j); //set k as output value
}
testcase2.timeout = 200; //set timeout to 20ms


var wsload = new Wsload();
wsload.runSuite('myFirstWsloadSuite',3,[testcase1,testcase2],null,300);