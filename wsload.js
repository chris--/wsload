var runSingleTestsuite = require('./lib/runSingleTestsuite.js');

var wsload = module.exports;
var suiteResults = new Array();
var suitesCompleted = 0;
var suitesToRun;
var cb;

wsload.runSuite = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_cb) {
	var suitenumber = 0;
	suitesToRun = param_timesToRunSuite;
	cb = param_cb;
	while (param_timesToRunSuite--) {
		runSingleTestsuite.run(suitenumber, param_suiteName, param_suiteTimeout, param_testFunctions, param_preTestFunction, function(err, result){
			if(err) {
				console.error(err);
			}
			suiteResults.push(result);
			suitesCompleted++;
			if(suitesCompleted==suitesToRun) {
				computeResult();
			}
		});
		suitenumber++;
	}
}

function computeResult() {
	
	//calculate statistics etc. here
	console.log('==========RESULT OVERVIEW==========');
	var suiteRunInMs = 0;
	var lowestSuiteDuration = 0;
	var highestSuiteDuration = 0;

	suiteResults.forEach(function(element){
		if (element.timeoutOccured) {
			//check which test timed out
			element.testsRun.forEach(function(testfunctionResult) {
				if (testfunctionResult.runDurationInMs==null) {
					console.log('i timed out: ' + testfunctionResult.testname); //this test timed out
				}
			});
			suiteRunInMs = element.timeout;
			lowestSuiteDuration = element.timeout;
			highestSuiteDuration = element.timeout;
			return;
		}
		if (lowestSuiteDuration>element.runDurationInMs || lowestSuiteDuration === 0) {
			lowestSuiteDuration = element.runDurationInMs;
		}
		if (highestSuiteDuration<element.runDurationInMs) {
			highestSuiteDuration = element.runDurationInMs;
		}
		suiteRunInMs = suiteRunInMs + element.runDurationInMs;
	})
	
	console.log('average suite duration: ' + suiteRunInMs/suiteResults.length + ' ms');
	console.log('min suite duration: ' + lowestSuiteDuration + ' ms');
	console.log('max suite duration: ' + highestSuiteDuration + ' ms');
	
	cb(null, 'done');
}
