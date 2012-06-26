/**
*	measure.js
*		Measure time (in milliseconds) from a defined start to stop. when a timeout is specified, 
*		the callback will be executed when the timeout is reached.
*
*	Constructor:
*		Measure(param_timeout, param_cb)
*	
*	Methods:
*		start()
*		stop()
*
*	Usage:
*	var Measure = require(./Measure.js);
*	var timeout = 100;
*	var callback = function (err,result) {
*		if (!err) {
*			console.log(result);
*		} else {
*			console.log(err); //timeout occured
*		}
*	}
*	var stopWatch = new Measure(timeout,callback);
*	
*	stopWatch.start();
*	// do something time intensive here
*	measure.stop();
*/
var Measure = module.exports = function(param_timeout, param_cb) {
	this.timeout = param_timeout;
	this.cb = param_cb;
}


Measure.prototype = {
	startDate: "0",
	timeout:"0",
	cb:null,
	timeoutTimer:null,
	timedOut:false,

	start : function() {
		var that = this;
		this.startDate = new Date();
		this.timeoutTimer = setTimeout(function(){
			// i timed out
			that.cb('timeout',null);
			that.timedOut = true;
		},this.timeout);
	},
	
	stop : function() {
		var stopDate = new Date();
		clearTimeout(this.timeoutTimer);
		if(!this.timedOut) {
			this.cb(null,(stopDate-this.startDate));
		}
	}
}