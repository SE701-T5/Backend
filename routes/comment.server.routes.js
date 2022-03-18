const comment = require('../controllers/comment.server.controller');

/**
 * Handles HTTP requests for the Comment module using Express.js route()
 * @param app Express.js application object
 */
module.exports = function(app) {
    app.route('/api/v1/comments')
        .get(forum.postViews)
        .post(forum.postCreate);
}
