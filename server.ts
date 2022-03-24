import config from "./config/config.server.config";
import { connect } from './config/db.server.config'
import createApp from './config/express.server.config';

// Express.js application object
const app = createApp();

const PORT = config.get('port');

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
