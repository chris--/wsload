var Logger = require('../lib/Logger.js');

var logger = new Logger({logTarget:'db'});

logger.log('test');


//logger.closeDb();	