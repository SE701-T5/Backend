const
    User = require('../models/user.server.model'),
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
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.userCreate = function(req, res) {
    const reqBody = req.body;

    const forumUserParams = {
        'username': reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
        'displayName': reqBody.displayName && reqBody.displayName.length > 2 ? reqBody.displayName : generateDisplayName(),
        'email': reqBody.email && emailValidator.validate(reqBody.email) ? reqBody.email : false,
        'hashedPassword': reqBody.password && reqBody.password.length > 0 ? reqBody.password : false
    }

    if (isAllFieldsValid(forumUserParams)) {
        User.createUser(forumUserParams, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // User was created successfully, return 201 status
                res.status(201).json({"user": result});
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
 * @param req HTTP request object containing the user document fields being updated
 * @param res HTTP request response object containing the updated user document data
 */
exports.userUpdateById = function(req, res) {
    const
        reqParams = req.params,
        reqBody = req.body;
    let userUpdateParams,
        isBadRequest = !isValidDocumentID(reqParams.id); // Check that a valid ID exists in the request parameters

    if (!isBadRequest) {
        // Set fields for updating to an object with either passed values or false to declare them as invalid
        userUpdateParams = {
            "username": reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
            "displayName": reqBody.displayName && reqBody.displayName.length > 2 ? reqBody.displayName : false,
            "email": reqBody.email && emailValidator.validate(reqBody.email) ? reqBody.email : false,
            "hashedPassword": reqBody.password && reqBody.password.length > 0 ? reqBody.password : false
        }
        isBadRequest = !isAnyFieldValid(userUpdateParams); // Checks for any valid field, removes all invalid fields
    }

    if (!isBadRequest) {
        const isUserAuthenticated = true; // TODO: implement user authentication

        if (isUserAuthenticated) {
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
            res.status(401).send("Unauthorized");
        }
    } else {
        res.status(400).send("Bad request");
    }
}

/**
 * Delete the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
 exports.userDeleteById = function(req, res) {
    const reqParams = req.params;

    if (isValidDocumentID(reqParams.id)) {
        const isUserAuthenticated = true; // TODO: implement user authentication

        if (isUserAuthenticated) {
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
            res.status(401).send("Unauthorized");
        }
    } else {
        res.status(400).send("Bad request");
    }
}
