const database = require('../controllers/db.server.controller');

/**
 * Handles HTTP requests for the Database module using Express.js route()
 * @param app Express.js application object
 */
module.exports = function(app) {
    app.route('/api/v1/reset')
        .post(database.resetDB);

    app.route('/api/v1/resample')
        .post(database.resampleDB);
}
