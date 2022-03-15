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
 * @param res HTTP request response object
 */
exports.postCreate = function(req, res) {
    // TODO: implement postCreate()
    res.json({ dummyTest: "postCreate() dummy test passes" });
}

/**
 * Responds to HTTP request with a formatted post document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
exports.postViewById = function(req, res) {
    // TODO: implement postViewById()
    res.json({ dummyTest: "postViewById() dummy test passes" });
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
