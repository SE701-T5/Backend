const
    { connect } = require('./config/db.server.config'),
    express = require('./config/express.server.config');

// Express.js application object
const app = express();

// Server port - use environment variable PORT or enter here
const PORT = process.env.PORT;

// Database name - use environment variable DATABASE_NAME or enter here
const databaseName = process.env.DATABASE_NAME;

// Connect to MongoDB database
connect(databaseName)
    .then(
        () => {
            app.listen(PORT, function () {
                console.log(`Listening on port ${PORT}`);
            });
        },
        (err) => {
            console.log('Unable to connect to MongoB');
            console.log(`Database connection error: ${err}`);
            process.exit(1)
        });

module.exports = app;
