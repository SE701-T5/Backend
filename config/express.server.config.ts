import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { errorHandler, logger } from '../lib/middleware.lib';
import { ServerError } from '../lib/utils.lib';
import config from './config.server.config';
import path from 'path';

import dbServerRoutes from '../routes/db.server.routes';
import forumServerRoutes from '../routes/forum.server.routes';
import userServerRoutes from '../routes/user.server.routes';
import communityServerRoutes from '../routes/community.routes';
import { StatusCodes } from 'http-status-codes';

/**
 * Configure Express.js application
 * @returns Express.js application object
 */
export default function () {
  // Create Express.js application
  const app = express();

  // This is required for parsing application/json in req.body
  app.use(bodyParser.json());
  app.use(cors());

  const level = config.get('environment') == 'testing' ? 'error' : 'info';
  app.use(
    pinoHttp({
      logger,
      level,
    }),
  );

  // Set response headers using middleware
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'X-Authorization, Origin, X-Requested-With, Content-Type, Accept',
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });

  // HTTP GET request to homepage with a message response stating the server is running
  app.get('/health', function (req, res) {
    res.status(StatusCodes.OK).json({
      msg: 'The server is up and running!',
      tim: new Date().getTime(),
    });
  });

  // Configure HTTP routes
  dbServerRoutes(app);
  forumServerRoutes(app);
  userServerRoutes(app);
  communityServerRoutes(app);

  // Add uploads folder
  app.use(config.get('uploadsRoute'), express.static('uploads'));

  // 404 Route
  app.all('*', () => {
    throw new ServerError('endpoint does not exist', StatusCodes.NOT_FOUND);
  });

  // Configure Error Handler
  app.use(errorHandler);

  return app;
}
