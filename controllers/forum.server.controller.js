const
    Forum = require('../models/forum.server.model'),
    {
        isValidDocumentID,
        parseInteger,
        isAnyFieldValid,
        isAllFieldsValid
    } = require("../lib/validate.lib");

/**
 * Responds to HTTP request with formatted post documents matching a given forum search
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postViews = function(req, res) {
    // TODO: implement postViews()
    res.json({ dummyTest: "postViews() dummy test passes" });
}

/**
 * Creates a new forum post using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response status code, and message if error, or JSON if successful
 */
exports.postCreate = function(req, res) {
    const reqBody = req.body;

    // Set forum post fields to an object for passing to the model
    const forumPostParams = {
        "userID": reqBody.userID && reqBody.userID.length > 2 ? reqBody.userID : false,
        "title": reqBody.title.length && reqBody.title.length > 0 ? reqBody.title : false,
        "communityID": reqBody.communityID && reqBody.communityID.length > 2 ? reqBody.communityID : false,
        "bodyText": reqBody.text || "",
        "attachments": reqBody.images || [""]
    };

    // Confirm that all forum post field values are valid
    if (isAllFieldsValid(forumPostParams)) {
        const isUserAuthenticated = true; // TODO: implement user authentication

        if (isUserAuthenticated) {
            // Insert new forum post to database
            Forum.insertPost(forumPostParams, function (result) {
                if (result.err) {
                    // Return the error message with the error status
                    res.status(result.status).send(result.err);
                } else {
                    // Return the forum post document object with 201 status
                    res.status(201).json({"forumPost": result});
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
 * Responds to HTTP request with a formatted post document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postViewById = function(req, res) {
    Forum.searchById(req.params.id, function(result) {
        if (result.err) {
            // Return the error message with the error status
            res.status(result.status).send(result.err);
        } else {
            // Return the forum post document object with 200 status
            res.json({"forumPost": result});
        }
    });
}

/**
 * Modifies the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postUpdateById = function(req, res) {
    const
        reqParams = req.params,
        reqBody = req.body;
    let forumUpdateParams;

    // Check that a valid ID exists in the request parameters
    let isBadRequest = !isValidDocumentID(reqParams.id);

    if (!isBadRequest) {
        // Set fields for updating to an object with either passed values or false to declare them as invalid
        forumUpdateParams = {
            "communityID": reqBody.communityID && reqBody.communityID.length > 2 ? reqBody.communityID : false,
            "title": reqBody.title && reqBody.title.length > 0 ? reqBody.title : false,
            "bodyText": reqBody.text || false,
            "upVotes": reqBody.upVotes ? parseInteger(reqBody.upVotes, 0) : false,
            "downVotes": reqBody.downVotes ? parseInteger(reqBody.downVotes, 0) : false,
            "attachments": reqBody.images || false
        }

        // Check that there is not zero valid fields being updated, removes invalid fields
        isBadRequest = !isAnyFieldValid(forumUpdateParams);
    }

    if (!isBadRequest) {
        const isUserAuthenticated = true; // TODO: implement user authentication

        if (isUserAuthenticated) {
            Forum.updatePostById(reqParams.id, forumUpdateParams, function (result) {
                if (result.err) {
                    // Return the error message with the error status
                    res.status(result.status).send(result.err);
                } else {
                    // Return the forum post document object with 201 status
                    res.status(201).json({"forumPost": result});
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
 * Responds to HTTP request with formatted comment document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.commentViewById = function(req, res) {
    // TODO: implement commentViewById()
    res.json({ dummyTest: "commentViewById() dummy test passes" });
}

/**
 * Creates a new comment for a forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post comment field data, and post ID
 * @param res HTTP request response status code, and message if error, or JSON with comment data if successful
 */
exports.commentGiveById = function(req, res) {
    const
        reqParams = req.params,
        reqBody = req.body,
        commentParams = {
            'postID': isValidDocumentID(reqParams.id) ? reqParams.id : false,
            'authorID': isValidDocumentID(reqBody.authorID) ? reqBody.authorID : false,
            'authorUserName': reqBody.username && reqBody.username.length > 2 ? reqBody.username : false,
            'bodyText': reqBody.bodyText && reqBody.bodyText.length > 0 ? reqBody.bodyText : false,
            "attachments": reqBody.images ? reqBody.images : [""]
        };

    if (isAllFieldsValid(commentParams)) {
        Forum.addComment(commentParams, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // Comment was created successfully, return 201 status
                res.status(201).json({"comment": result});
            }
        });
    }
    else {
        res.status(400).send("Bad request");
    }
}

/**
 * Modifies the data of an existing forum post comment matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.commentUpdateById = function(req, res) {
    // TODO: implement postUpdateById()
    res.json({ dummyTest: "commentUpdateById() dummy test passes" });
}

/**
 * Delete the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postDeleteById = function(req, res) {
    const reqParams = req.params;

    // Check that a valid ID exists in the request parameters
    let isBadRequest = !isValidDocumentID(reqParams.id);

    if (!isBadRequest) {
        const isUserAuthenticated = true; // TODO: implement user authentication

        if (isUserAuthenticated) {
            Forum.deletePostById(reqParams.id, function (result) {
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
