const
    database = require('./config/db.server.config'),
    express = require('./config/express.server.config');

// Express.js application object
const app = express();

module.exports = app;
