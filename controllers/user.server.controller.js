const User = require('../models/user.server.model');

/**
 * Returns the hashPassword given a plaintextPassword
 * @param {String} password
 */
 function hashPassword(password) {
    // TODO: Create a has function for the password
    return 'password'
}

/**
 * Creates a new forum user using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userCreate = function(req, res) {
    const
        username = req.body.username,
        name = req.body.name,
        email = req.body.email,
        hashedPassword = hashPassword(req.body.password);

    User.create(
        username,
        name,
        email,
        hashedPassword
    );
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
    // TODO: implement userViewById()
    res.json({ dummyTest: "userViewById() dummy test passes" });
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