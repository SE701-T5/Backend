import { Express } from 'express';
import * as forum from '../controllers/forum.server.controller';
import { asyncHandler, isRequestTokenAuthorized } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the Forum module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app.route('/api/v1/posts').get(asyncHandler(forum.postViews));

  app
    .route('/api/v1/posts/:id')
    .get(forum.postViewById)
    .patch(isRequestTokenAuthorized, asyncHandler(forum.postUpdateById))
    .delete(isRequestTokenAuthorized, asyncHandler(forum.postDeleteById));

  app
    .route('/api/v1/posts/:id/comments')
    .get(asyncHandler(forum.commentViewById))
    .post(asyncHandler(forum.commentGiveById));

  app
    .route('/api/v1/posts/comments/:id')
    .patch(asyncHandler(forum.commentUpdateById));
}
