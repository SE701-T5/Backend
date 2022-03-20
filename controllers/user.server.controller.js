const
    User = require('../models/user.server.model'),
    { configParams } = require('../config/config.server.config'),
    emailValidator = require('email-validator'),
    {
        isValidDocumentID,
        isAnyFieldValid,
        isAllFieldsValid
    } = require("../lib/validate.lib");

/**
 * Returns a random displayName (e.g. User0001)
 */
function generateDisplayName() {
    let maxValue = 9999
    let randomNumber = Math.floor(Math.random() * maxValue);
    return "User" + randomNumber.toString()
}

/**
 * Creates a new forum user using HTTP request object data
 * @param req HTTP request object containing the data used for creating a new forum user document in the database
 * @param res HTTP request response object status code and user data in JSON format, or error message
 */
exports.userCreate = function(req, res) {
    const
        reqBody = req.body,
        forumUserParams = {
        'username': reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
        'displayName': reqBody.displayName && reqBody.displayName.length > 2 ? reqBody.displayName : generateDisplayName(),
        'email': reqBody.email && emailValidator.validate(reqBody.email) ? reqBody.email : false,
        'plaintextPassword': reqBody.plaintextPassword && reqBody.plaintextPassword.length > 0 ? reqBody.plaintextPassword : false
    }

    if (isAllFieldsValid(forumUserParams)) {
        User.createUser(forumUserParams, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // User was created successfully, return 201 status
                res.status(201).json({ "userData": result });
            }
        });
    }
    else {
        res.status(400).send("Bad request");
    }
}

/**
 * Logs in an authenticated forum user using HTTP request object data
 * @param req HTTP request object containing the user login (email or username) and password for authentication
 * @param res HTTP request response object status code and user ID and authorization token, or error message
 */
exports.userLogin = function(req, res) {
    const
        reqBody = req.body,
        plaintextPassword = reqBody.plaintextPassword && reqBody.plaintextPassword.length > 0 ? reqBody.plaintextPassword : false;

    const forumUserLoginBody = {
        'username': reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
        'email': reqBody.email && emailValidator.validate(reqBody.email) ? reqBody.email : false
    }

    if (isAnyFieldValid(forumUserLoginBody) && plaintextPassword) {
        User.authenticateUser(forumUserLoginBody, plaintextPassword,function (result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                if (result) {
                    const userID = result._id;
                    User.getUserAuthToken(userID, function(result) {
                        if (result.err) {
                            // Return the error message with the error status
                            res.status(result.status).send(result.err);
                        } else if (result) {
                            // Return the authorization token if already set for the user
                            res.send({ status: 200, userID: userID, authToken: result.authToken });
                        } else {
                            // Set a new authorization token if one not already set for the user
                            User.setUserAuthToken(userID, function(result) {
                                if (result.err) {
                                    // Return the error message with the error status
                                    res.status(result.status).send(result.err);
                                } else {
                                    // Return the newly set authorization token for the user
                                    res.send({ status: 200, userID: userID, authToken: result.authToken });
                                }
                            });
                        }
                    });
                } else {
                    res.status(404).send("Not found");
                }
            }
        });
    } else {
        res.status(400).send("Bad request");
    }
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
 * Responds to HTTP request with user document data matching a given user ID
 * @param req HTTP request object containing user ID and authorization token for verification
 * @param res HTTP request response status code and user data in JSON format or error message
 */
exports.userViewById = function(req, res) {
    const id = req.params.id;

    if (isValidDocumentID(id)){
        User.searchUserById(id, function(result) {
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
 * @param req HTTP request object containing the user fields being updated, user ID and auth token for verification
 * @param res HTTP request response object status code and updated user data in JSON format or error message
 */
exports.userUpdateById = function(req, res) {
    const
        reqParams = req.params,
        authToken = req.get(configParams.get('authToken')),
        reqBody = req.body;

    // Set fields for updating to an object with either passed values or false to declare them as invalid
    let userUpdateParams = {
        "username": reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
        "displayName": reqBody.displayName && reqBody.displayName.length > 2 ? reqBody.displayName : false,
        "email": reqBody.email && emailValidator.validate(reqBody.email) ? reqBody.email : false,
        "hashedPassword": reqBody.plaintextPassword && reqBody.plaintextPassword.length > 0 ? reqBody.plaintextPassword : false
    }

    if (isValidDocumentID(reqParams.id) && isAnyFieldValid(userUpdateParams)) {
        User.isUserAuthorized(reqParams.id, authToken, function(result) {
            if (result.isAuth) {
                User.updateUserById(reqParams.id, userUpdateParams, function (result) {
                    if (result.err) {
                        // Return the error message with the error status
                        res.status(result.status).send(result.err);
                    } else {
                        // Return the forum post document object with 201 status
                        res.status(201).json({"updatedForumUser": result});
                    }
                });
            } else {
                if (result.err) {
                    // Return the error message with the error status
                    res.status(result.status).send(result.err);
                } else {
                    res.status(401).send("Unauthorized");
                }
            }
        });
    } else {
        res.status(400).send("Bad request");
    }
}

/**
 * Delete the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object containing the user ID and authorization token for verification
 * @param res HTTP request response status code with message for whether in error or success
 */
 exports.userDeleteById = function(req, res) {
    const
        reqParams = req.params,
        authToken = req.get(configParams.get('authToken'));

    if (isValidDocumentID(reqParams.id)) {
        User.isUserAuthorized(reqParams.id, authToken, function(result) {
            if (result.isAuth) {
                User.deleteUserById(reqParams.id, function (result) {
                    if (result.err) {
                        // Return the error message with the error status
                        res.status(result.status).send(result.err);
                    } else {
                        // Return a message body { success: true } with 200 status
                        res.status(200).json({ "success": true });
                    }
                });
            } else {
                if (result.err) {
                    // Return the error message with the error status
                    res.status(result.status).send(result.err);
                } else {
                    res.status(401).send("Unauthorized");
                }
            }
        });
    } else {
        res.status(400).send("Bad request");
    }
}
