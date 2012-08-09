module.exports = {
	setUp : function (callback) {
		this.MongoAdapter = require('../../lib/MongoAdapter.js');
		callback();
	},
	"open database connection" : function (test) {
		var that = this;
		test.doesNotThrow ( function() {
			var mongoAdapterInstance = new that.MongoAdapter(function(err,db){
				test.equal(err,null);
				test.notEqual(db,null);
				mongoAdapterInstance.close(true, function(){
					test.done();	
				});
			});
		});
	}
};