import config from './config/config.server.config';
import { connect } from './config/db.server.config';
import createApp from './config/express.server.config';
import express from 'express';

// Express.js application object
const app = createApp();

const PORT = config.get('port');

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB database
connect().then(
  () => {
    app.listen(PORT, function () {
      console.log(`Listening on port ${PORT}`);
    });
  },
  (err) => {
    console.log('Unable to connect to MongoB');
    console.log(`Database connection error: ${err}`);
    process.exit(1);
  },
);

export default app;
