var Testsuite = require('./lib/Testsuite.js');

var wsload = module.exports;

wsload.runSuite = function (param_suiteName, param_timesToRunSuite, param_testFunctions, param_preTestFunction, param_suiteTimeout, param_cb) {
	
	//keep track of finished suites
	var suitesFinished = 0;
	var suitesCreated = 0;

	//create suites
	var suites = new Array();
	while(param_timesToRunSuite--) {
		suites.push(new Testsuite(suitesCreated++, param_suiteName, param_suiteTimeout, param_testFunctions, param_preTestFunction, null));
	}
	//add listeners
	suites.forEach(function(testsuite){
		testsuite.on('finished', function(result){
			suitesFinished++;
			if(suitesFinished==suitesCreated) {
				console.log('finito');
			} 
		});

		testsuite.on('timeout', function(suite, test){
			console.log('suite #' + suite + ' timed out in test ' + test);
			suitesFinished++;
		});
	});
	//run suites
	suites.forEach(function(testsuite){
		testsuite.run();
	});

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
			//suiteRunInMs = element.timeout;
			//lowestSuiteDuration = element.timeout;
			//highestSuiteDuration = element.timeout;
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
