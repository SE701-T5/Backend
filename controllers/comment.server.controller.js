const User = require('../models/comment.server.model');

/**
 * Creates a new comment for a forum post using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.commentCreate = function (req, res) {
    Comment.create(username, name, date, content, function (result) {
        if (result.err) {
            // Return the error message with the error status
            res.status(result.status).send(result.err);
        } else {
            // Return the comment document object with 201 status
            res.status(201).json({ "comment": result });
        }
    });
}