const Forum = require('../models/forum.server.model');

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
    let
        isBadRequest = false,
        forumPostParams;

    // Check that every expected forum post attribute exists in the request body
    if (!reqBody.userID || !reqBody.title || !reqBody.communityID || !reqBody.text || !reqBody.images) {
        isBadRequest = true;
    }

    if (!isBadRequest) {
        // Set forum post attributes to an object for passing to the model
        forumPostParams = {
            "userID": reqBody.userID.length > 2 ? reqBody.userID : false,
            "title": reqBody.title.length > 0 ? reqBody.title : false,
            "communityID": reqBody.communityID.length > 2 ? reqBody.communityID : false,
            "text": reqBody.text || "",
            "images": reqBody.images || [""],
        };

        // Confirm that forum post attribute values are valid
        for (let key in forumPostParams) {
            if (forumPostParams[key] === false) {
                isBadRequest = true;
            }
        }
    }

    if (!isBadRequest) {
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
    const post = Forum.searchById(req.params.id)

    if (post) {
        res.json(post);
    }
    else {
        res.sendStatus(404);
    }
}

/**
 * Modifies the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postUpdateById = function(req, res) {
    // TODO: implement postUpdateById()
    res.json({ dummyTest: "postUpdateById() dummy test passes" });
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
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.commentGiveById = function(req, res) {
    // TODO: implement commentGiveById()
    res.json({ dummyTest: "commentGiveById() dummy test passes" });
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
