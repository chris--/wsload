module.exports = {
	setUp : function (callback) {
		this.Logger = require('../../lib/Logger.js');
		callback();
	},
	"test Log To db" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			var loggerInstance = new that.Logger( {logTarget:'db'} );
			loggerInstance.log( {uuid:'from-unit-test'} );
			setTimeout(function(){
				loggerInstance.closeDb();
				test.done();
			},100);
		});
	}/* not yet in use,
	"test Get From db" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			var loggerInstance = new that.Logger();
			//loggerInstance.log( {uuid:'from-unit-test'} );
			setTimeout(function(){
				loggerInstance.get('from-unit-test', function (err,resultArray) {
					test.equal(err, null);
					console.log(err);
					test.notEqual(resultArray[0], null)
					test.done();
				});
			},100);
		});
	}*/
};