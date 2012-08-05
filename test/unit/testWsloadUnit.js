module.exports = {
	setUp : function (callback) {
		this.Wsload = require('../../Wsload.js');
		callback();
	},
	"test instanciate Wsload" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			var wsloadInstance = new that.Wsload( {logTarget:'db'} );
			test.done();
		});
	},
	"test instanciate and run Wsload" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			
			var wsloadInstance = new that.Wsload( {logTarget:'db'} );
			
			var preTestFunc = function preTestFunc (cb){
				var randomnumber=Math.floor(Math.random()*101); //wait 1-100 ms
				setTimeout(cb,randomnumber);
			};
			
			var testcase1 = function add (param, cb, global) {
				var i = 1;
				var j = 2;
				var k = i+j;
				setTimeout(function(){
					cb(null, k); //set k as output value
				},1);
			}
			testcase1.timeout = 15; //set timeout to 15ms


			var testcase2 = function subtract (param, cb, global) {
				var i = param; 	//matches k from testcase1 (=3)
				var j = i-1;
				//console.log('test2: j=' + j);	//j=2
				cb(null, j); //set k as output value
			}
			testcase2.timeout = 20; //set timeout to 20ms

			
			wsloadInstance.on('finished', function (msg) {
				test.done();
			});
			wsloadInstance.on('timeout', function (msg) {
				test.ok(false);
			});
			wsloadInstance.runSuite('myFirstWsloadSuite',3,[testcase1,testcase2],null,300,null);
		});
	}
};