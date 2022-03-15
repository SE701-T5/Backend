const forum = require('../controllers/forum.server.controller');

/**
 * Handles HTTP requests for the Forum module using Express.js route()
 * @param app Express.js application object
 */
module.exports = function(app) {
    app.route('/api/v1/posts')
        .get(forum.postViews)
        .post(forum.postCreate);

    app.route('/api/v1/posts/:id')
        .get(forum.postViewById)
        .patch(forum.postUpdateById);

    app.route('/api/v1/posts/:id/comments')
        .get(forum.commentViewById)
        .post(forum.commentGiveById);

    app.route('/api/v1/posts/:id/comments/:id')
        .patch(forum.commentUpdateById);
}
