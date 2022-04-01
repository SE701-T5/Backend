import { Express } from 'express';
import * as user from '../controllers/user.server.controller';
import { asyncHandler, isAuthenticated } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the User module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app.route('/api/v1/users').post(asyncHandler(user.userCreate));

  app.route('/api/v1/users/login').post(asyncHandler(user.userLogin));

  app
    .route('/api/v1/users/logout')
    .post(isAuthenticated, asyncHandler(user.userLogout));

  app
    .route('/api/v1/users/:id')
    .get(user.userViewById)
    .patch(isAuthenticated, asyncHandler(user.userUpdateById))
    .delete(isAuthenticated, asyncHandler(user.userDeleteById));
}
