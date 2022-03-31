import { Express } from 'express';
import * as database from '../controllers/db.server.controller';
import { asyncHandler } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the Database module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app.route('/api/v1/db/reset').post(asyncHandler(database.resetDB));
  app.route('/api/v1/db/resample').post(asyncHandler(database.resampleDB));
}
