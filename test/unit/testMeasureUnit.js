module.exports = {
	setUp : function (callback) {
		this.Measure = require('../../lib/Measure.js')
		callback();
	},
	"test Timeout occured" : function (test) {
		var measureInstance = new this.Measure(200, function (err,time) {
			//this should be automatically called after 200ms because of a timeout
			test.equal(err,'timeout');
	    	test.equal(time, null);
	    	test.done();
		});
		measureInstance.start();
	},
	"test measure 10 Milliseconds" : function (test) {
		var measureInstance = new this.Measure(200, function (err,time) {
			test.equal(err, null); //no timeout occured
			test.ok(time>=9);
			test.ok(time<=14);
			test.done();
		});
		measureInstance.start();
		setTimeout(function(){
			//execute after 10ms
			measureInstance.stop();
		},10);
	},
	"test measure 100 Milliseconds" : function (test) {
		var measureInstance = new this.Measure(200, function (err,time) {
			test.equal(err, null); //no timeout occured
			test.ok(time>=99);
			test.ok(time<=105);
			test.done();
		});
		measureInstance.start();
		setTimeout(function(){
			//execute after 10ms
			measureInstance.stop();
		},100);
	}
};