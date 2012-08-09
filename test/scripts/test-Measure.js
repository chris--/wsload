exports.testComponentMeasureCorrectParams = function(test) {
	var Measure = require('./Measure.js');

	var timeout = 1000;
	var measureTime = 500;
	var m1 = new Measure(timeout,function(err,result){
			test.equal(err,null, 'no Timeout should occur');
			test.ok(result<measureTime+10, 'result not too high');
			test.ok(result>measureTime-10, 'result not too low');
			test.done();
	});

	m1.start();
	setTimeout(function(){m1.stop()},measureTime);	
}



exports.testComponentMeasureTimeout = function(test) {
	var Measure = require('./Measure.js');

	var timeout = 100;
	var measureTime = 500;
	var m1 = new Measure(timeout,function(err,result){
			test.equal(err, 'timeout');
			test.equal(result,null);
			test.done();
	});

	m1.start();
	setTimeout(function(){m1.stop();},measureTime);	

	//test.expect(2);
}

exports.testComponentMeasureParallelMeasurement = function(test) {
	var Measure = require('./Measure.js');

	var finishedTests = 0;
	var timeoutm1 = 100;
	var timeoutm2 = 1000;
	var measureTime = 500;


	function finished() {
		finishedTests++;
		if (finishedTests === 2) {
			test.done();
		}
	}

	var m1 = new Measure(timeoutm1,function(err,result){
			test.equal(err, 'timeout');
			test.equal(result,null);
			finished();
	});

	var m2 = new Measure(timeoutm2,function(err,result){
			test.equal(err,null, 'no Timeout should occur');
			test.ok(result<measureTime+10, 'result is too high');
			test.ok(result>measureTime-5, 'result is too low');
			finished();
	});


	m1.start();
	m2.start();
	setTimeout(function(){m1.stop();},measureTime);	
	setTimeout(function(){m2.stop();},measureTime);	

}
