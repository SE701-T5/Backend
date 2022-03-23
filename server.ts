import { connect } from './config/db.server.config'
import express from './config/express.server.config';

// Express.js application object
const app = express();

// Server port - use environment variable PORT or enter here
const PORT = process.env.PORT ?? 4200;

// Database name - use environment variable DATABASE_NAME or enter here
const databaseName = process.env.DATABASE_NAME as string;

// Connect to MongoDB database
connect()
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

export default app;
