/*
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

/** 
 * Expose `Measure`
 */

module.exports = Measure;


/**
 * Initialize a new `Measure` Object.
 *
 * Measure time (in milliseconds) from a defined start to stop. 
 * When a timeout is specified, the callback will be executed 
 * when the timeout is reached.
 * 
 * @param {Integer} param_timeout
 * @param {Function} param_cb
 * @api private
 */

function Measure (param_timeout, param_cb) {
	this.timeout = param_timeout;
	this.cb = param_cb;
};

/**
 * add default values
 */

Measure.prototype = {
	startDate: "0",
	timeout:"0",
	cb:null,
	timeoutTimer:null,
	timedOut:false
};

/**
 * starts a measurement
 *
 * @api private
 */

Measure.prototype.start = function () {
	var that = this;
	this.startDate = new Date();
	this.timeoutTimer = setTimeout(function () {
		// i timed out
		that.cb('timeout',null);
		that.timedOut = true;
	},this.timeout);
};

/**
 * stops a measurement
 *
 * @api private
 */

Measure.prototype.stop = function () {
	var stopDate = new Date();
	clearTimeout(this.timeoutTimer);
	if(!this.timedOut) {
		if ((stopDate-this.startDate) > 0) {
			this.cb(null,(stopDate-this.startDate));
		} else {
			this.cb(null,1);
		}
	}
};