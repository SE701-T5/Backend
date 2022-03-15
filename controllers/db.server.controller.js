const Database = require('../models/db.server.model');

/**
 *
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.resetDB = function(req, res) {
    // TODO: implement resetDB()
    res.json({ dummyTest: "resetDB() dummy test passes" });
}

/**
 *
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.resampleDB = function(req, res) {
    // TODO: implement resampleDB()
    res.json({ dummyTest: "resampleDB() dummy test passes" });
}
