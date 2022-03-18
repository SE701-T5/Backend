const
    express = require('express'),
    bodyParser = require('body-parser');

/**
 * Configure Express.js application
 * @returns Express.js application object
 */
module.exports = function() {
    // Create Express.js application
    const app = express();

    // This is required for parsing application/json in req.body
    app.use(bodyParser.json());

    // Configure HTTP routes
    require('../routes/db.server.routes.js')(app);
    require('../routes/forum.server.routes.js')(app);
    require('../routes/user.server.routes.js')(app);
    require('../routes/comment.server.routes.js')(app);

    return app;
};
