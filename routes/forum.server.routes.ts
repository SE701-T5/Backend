import { Express } from 'express';
import * as forum from '../controllers/forum.server.controller';
import { asyncHandler, isAuthenticated } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the Forum module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app.route('/api/v1/posts').get(asyncHandler(forum.postViews));

  app
    .route('/api/v1/posts/:id')
    .get(asyncHandler(forum.postViewById))
    .patch(isAuthenticated, asyncHandler(forum.postUpdateById))
    .delete(isAuthenticated, asyncHandler(forum.postDeleteById));

  app
    .route('/api/v1/posts/:id/comments')
    .get(asyncHandler(forum.commentViewById))
    .post(isAuthenticated, asyncHandler(forum.commentGiveById));

  app
    .route('/api/v1/comments/:id')
    .patch(isAuthenticated, asyncHandler(forum.commentUpdateById));
}
