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

    // Set response headers using middleware
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Authorization, Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
        next();
    });

    // HTTP GET request to homepage with a message response stating the server is running
    app.get('/', function(req, res){
        res.status(200).json({ "msg": "The server is up and running!" });
    });

    // Configure HTTP routes
    require('../routes/db.server.routes.js')(app);
    require('../routes/forum.server.routes.js')(app);
    require('../routes/user.server.routes.js')(app);

    return app;
};
