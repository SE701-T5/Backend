import { Express } from 'express';
import * as user from '../controllers/user.server.controller';
import { asyncHandler, isAuthenticated, upload } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the User module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app
    .route('/api/v1/users')
    .post(upload.single('profilePicture'), asyncHandler(user.userCreate));

  app.route('/api/v1/users/login').post(asyncHandler(user.userLogin));

  app
    .route('/api/v1/users/logout')
    .post(isAuthenticated, asyncHandler(user.userLogout));

  app
    .route('/api/v1/users/current')
    .get(isAuthenticated, user.userViewCurrent)
    .put(
      upload.single('profilePicture'),
      isAuthenticated,
      user.userUpdateCurrent,
    );

  app
    .route('/api/v1/users/:id')
    .get(user.userViewById)
    .patch(
      upload.single('profilePicture'),
      isAuthenticated,
      asyncHandler(user.userUpdateById),
    )
    .delete(isAuthenticated, asyncHandler(user.userDeleteById));

  app
    .route('/api/v1/users/:id/posts')
    .get(isAuthenticated, asyncHandler(user.currentUserPosts));
}
