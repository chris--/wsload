/**
 * Module dependencies
 */

var mongo = require('mongodb');

/** 
 * Expose `MongoAdapter`
 */

module.exports = MongoAdapter;

/**
 * Initialize a new `MongoAdapter`.
 *
 * Connects to a MongoDB on localhost
 *
 * TODO:
 *   Let the user decide, on which host the DB runs.
 * 
 * @param {Function} param_cb
 * @api private
 */

function MongoAdapter (param_cb) {
	var that = this;

	if (!this.db) {
		this.db = new mongo.Db('wsload', new mongo.Server('localhost',mongo.Connection.DEFAULT_PORT, {}), {});
		
		this.db.open(function(err, p_db) {
			if (err) {
				param_cb(err);
			} else {
				param_cb(null,that.db);
			}
		});
	} else {
		param_cb(null,this.db);
	}
};

/**
 * Convenience Method for retrieving db adapter
 *
 * @api private
 */

MongoAdapter.prototype.close = function (param_force, param_cb) {
	if (this.db) {
		this.db.close(param_force,param_cb);
	};
};