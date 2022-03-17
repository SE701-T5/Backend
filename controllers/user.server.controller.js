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
    const reqBody = req.body;
    let
        isBadRequest = false,
        forumUserParams;

    // Check that every expected forum user attribute exists in the request body
    if (!reqBody.username || !reqBody.displayName || !reqBody.email || !reqBody.password) {
        isBadRequest = true;
    }

    if (!isBadRequest) {
        forumUserParams = {
            'username': reqBody.username.length < 2 ? reqBody.username : false,
            'displayName': reqBody.displayName.length < 2 ? reqBody.displayName : false,
            'email': reqBody.email.length > 0 ? reqBody.email : false,
            'hashedPassword': reqBody.password.length > 0 ? hashPassword(reqBody.password) : false
        }
    }

    // Confirm that forum post attribute values are valid
    for (let key in forumUserParams) {
        if (forumUserParams[key] === false) {
            isBadRequest = true;
        }
    }

    if (!isBadRequest) {
        User.create(forumUserParams, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // User was created successfully, return 201 status
                res.status(201).send("User created successfully!");
            }
        });
    }
    else {
        res.status(400).send("Bad request");
    }
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