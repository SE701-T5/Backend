const User = require('../models/user.server.model');


/**
 * Creates a new forum user using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userCreate = function(req, res) {
    // TODO: implement userCreate()
    res.json({ dummyTest: "userCreate() dummy test passes" });
}

/**
 * Logs in an authenticated forum user using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userLogin = function(req, res) {
    // TODO: implement userLogin()
    res.json({ dummyTest: "userLogin() dummy test passes" });
}

/**
 * Logs out a logged in forum user
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userLogout = function(req, res) {
    // TODO: implement userLogout()
    res.json({ dummyTest: "userLogout() dummy test passes" });
}

/**
 * Responds to HTTP request with formatted user document matching an ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userViewById = function(req, res) {
    const id = req.params.id;
    let isBadRequest = false;
    if (!id) {
        isBadRequest = true;
    }
    if (!isBadRequest){
        User.searchById(id, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // Return the user document object with 200 status
                res.json({"user": result});
            }
        });
    } else {
        res.status(400).send("Bad request");
    }

}





/**
 * Modifies the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userUpdateById = function(req, res) {
    // TODO: implement userUpdateById()
    res.json({ dummyTest: "userUpdateById() dummy test passes" });
}