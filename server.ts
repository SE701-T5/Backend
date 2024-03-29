import { resolve } from 'promise';
import config from './config/config.server.config';
import { connect } from './config/db.server.config';
import createApp from './config/express.server.config';
import { logger } from './lib/middleware.lib';

// Express.js application object
const app = createApp();
const PORT = config.get('port');

const connectFn = config.get('environment') == 'testing' ? resolve : connect;
// Connect to MongoDB database
connectFn().then(
  () => {
    if (require.main === module) {
      app.listen(PORT, function () {
        logger.info({ msg: 'server listening', port: PORT });
      });
    }
  },
  (err) => {
    logger.error({ msg: 'Unable to connect to MongoB', err: err as unknown });
    process.exit(1);
  },
);

export default app;
