const Database = require('../models/db.server.model');

/**
 * Responds to HTTP request for removing all documents from database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.resetDB = function(req, res) {
    const isAdminUserAuthenticated = true; // TODO: implement admin user authentication

    if (isAdminUserAuthenticated) {
        // Remove all documents in the database collections
        Database.resetCollections()
            .then((result) => {
                if (result.err) {
                    // Return the error message with the error status
                    res.status(result.status).send(result.err);
                } else {
                    res.status(result.status).send("OK");
                }
            })
    } else {
        res.status(401).send("Unauthorized");
    }
}

/**
 * Responds to HTTP request for adding sample documents to database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.resampleDB = function(req, res) {
    // TODO: implement resampleDB()
    res.json({ dummyTest: "resampleDB() dummy test passes" });
}
