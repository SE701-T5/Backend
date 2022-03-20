const
    user = require('../controllers/user.server.controller'),
    { isRequestTokenAuthorized } = require('../lib/middleware.lib');

/**
 * Handles HTTP requests for the User module using Express.js route()
 * @param app Express.js application object
 */
module.exports = function(app) {
    app.route('/api/v1/users')
        .post(user.userCreate);

    app.route('/api/v1/users/login')
        .post(user.userLogin);

    app.route('/api/v1/users/logout')
        .post(isRequestTokenAuthorized, user.userLogout);

    app.route('/api/v1/users/:id')
        .get(user.userViewById)
        .patch(isRequestTokenAuthorized, user.userUpdateById)
        .delete(isRequestTokenAuthorized, user.userDeleteById);
}
