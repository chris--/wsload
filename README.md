wsload
======

Load Testing Application for massive concurrent connections and complex scripted testcases v0.1.0


Install
=======

To install the most recent realease, simply use npm
    
    npm install wsload

and to run the Unit-Tests change to the install path of wsload and run

    npm test

Depends on a local [MongoDB](http://www.mongodb.org)-Installation and creates a database named 'wsload' where the results will be saved. 

Usage
=====

Create your testcases and set timeout values
--------------------------------------------

    var testcase1 = function add (input, cb, global) {
	        var i = 1;
	        var j = 2;
	        var k = i+j;
	        setTimeout(function(){
	                cb(null, k); //set k as output value
	        },1);
	}
	testcase1.timeout = 15; //set timeout to 15ms


	var testcase2 = function subtract (input, cb, global) {
	        var i = input;  //matches k from testcase1 (=3)
	        var j = i-1;
	        cb(null, j); //set k as output value
	}
	testcase2.timeout = 20; //set timeout to 20ms


Require wsload and instanciate a Testrunner
-------------------------------------------

	var wsload = new Wsload({logTarget:'db'});
	wsload.on('finished', function (result) {
	        console.log(result);
	});
	wsload.on('timeout', function (suitenumber, testcasesnumber) {
	        console.log('Timeout occured in Suite ' + suitenumber + ' Case ' + testcasenumber);
	});
	/*
	* Run a Testsuite with the name 'myFirstWsloadSuite' 3 times in parallel 
	*/
	wsload.runSuite('myFirstWsloadSuite',3,[testcase1,testcase2],null,300,null);


Feel free to use wsload and report any bugs on the [Issues Page](https://github.com/chris--/wsload/issues)


Licence
=======
(MIT LICENCE)

Copyright (c) 2012 Christian Vogt [mail](mailto:mail@christianvogt.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.