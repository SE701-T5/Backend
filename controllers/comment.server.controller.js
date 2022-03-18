const Comment = require('../models/comment.server.model');

/**
 * Creates a new comment for a forum post using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.commentCreate = function (req, res) {
    const reqBody = req.body;
    let
        isBadRequest = false,
        commentParams;

    // Check that every expected forum user attribute exists in the request body
    if (!reqBody.postID || !reqBody.authorID || !reqBody.authorDisplayName || 
        !reqBody.bodytext || !reqBody.date || !reqBody.upVotes || !reqBody.downVotes) {
        isBadRequest = true;
    }

    if (!isBadRequest) {
        commentParams = {
            'postID': reqBody.postID,
            'authorID': reqBody.authorID.length < 3 ? false : reqBody.authorID,
            'authorDisplayName': reqBody.authorDisplayName.length < 3 ? false : reqBody.authorDisplayName,
            'bodytext': reqBody.bodytext.length < 1 ? false : reqBody.bodytext,
            'date': reqBody.date,
            'upVotes': reqBody.upVotes,
            'downVotes': reqBody.downVotes
        }
    }

    // Confirm that comment attribute values are valid
    for (let key in commentParams) {
        if (commentParams[key] === false) {
            isBadRequest = true;
            break;
        }
    }

    if (!isBadRequest) {
        Comment.create(commentParams, function(result) {
            if (result.err) {
                // Return the error message with the error status
                res.status(result.status).send(result.err);
            } else {
                // User was created successfully, return 201 status
                res.status(201).json({"comment": result});
            }
        });
    }
    else {
        res.status(400).send("Bad request");
    }
}