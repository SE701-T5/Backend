import { Express } from 'express';
import * as community from '../controllers/community.server.controller';
import * as forum from '../controllers/forum.server.controller';
import { asyncHandler, isAuthenticated } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the Communities module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app
    .route('/api/v1/communities/:id')
    // .get(community.userViewById)
    .patch(
      isAuthenticated,
      asyncHandler(community.communityUpdateById),
    );

  app
    .route('/api/v1/communities/:id/posts')
    .post(isAuthenticated, asyncHandler(forum.postCreate))
    .get(asyncHandler(community.getPosts));

  app
    .route('/api/v1/communities')
    .get(asyncHandler(community.getCommunities))
    .post(isAuthenticated, asyncHandler(community.communityCreate));
}
