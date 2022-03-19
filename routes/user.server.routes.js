const user = require('../controllers/user.server.controller');

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
        .post(user.userLogout);

    app.route('/api/v1/users/:id')
        .get(user.userViewById)
        .patch(user.userUpdateById)
        .delete(user.userDeleteById);
}
