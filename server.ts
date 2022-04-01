import config from './config/config.server.config';
import { connect } from './config/db.server.config';
import createApp from './config/express.server.config';
import express from 'express';
import { logger } from './lib/middleware.lib';

// Express.js application object
const app = createApp();

const PORT = config.get('port');

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB database
connect().then(
  () => {
    app.listen(PORT, function () {
      logger.info({ msg: 'server listening', port: PORT });
    });
  },
  (err) => {
    logger.error({ msg: 'Unable to connect to MongoB', err: err as unknown });
    process.exit(1);
  },
);

export default app;
