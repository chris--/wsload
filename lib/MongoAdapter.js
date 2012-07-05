var mongo = require('mongodb');
var db = null;

var MongoAdapter = module.exports = function (param_cb) {
	if (!db) {
		db = new mongo.Db('wsload', new mongo.Server('localhost',mongo.Connection.DEFAULT_PORT, {}), {});
		
		db.open(function(err, p_db) {
			if (err) {
				throw Error("Logger: Cannot open Database");
			} else {
				param_cb(null,db);
			}
		});
	} else {
		param_cb(null,db);
	}
};
MongoAdapter.getInstance = MongoAdapter;


/*
MongoAdapter.prototype.getInstance = function () {
	if(this.db) {
		return this.db;
	} else {
		throw Error('db didnt open');
	}
};
*/