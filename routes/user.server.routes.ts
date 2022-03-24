import { Express } from 'express';
import * as user from '../controllers/user.server.controller';
import { isRequestTokenAuthorized } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the User module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app.route('/api/v1/users').post(user.userCreate);

  app.route('/api/v1/users/login').post(user.userLogin);

  app
    .route('/api/v1/users/logout')
    .post(isRequestTokenAuthorized, user.userLogout);

  app
    .route('/api/v1/users/:id')
    .get(user.userViewById)
    .patch(isRequestTokenAuthorized, user.userUpdateById)
    .delete(isRequestTokenAuthorized, user.userDeleteById);
}
