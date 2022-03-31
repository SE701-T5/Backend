import { Express } from 'express';
// import * as user from '../controllers/user.server.controller';
import * as community from '../controllers/community.server.controller';
import { asyncHandler, isRequestTokenAuthorized } from '../lib/middleware.lib';

/**
 * Handles HTTP requests for the Communities module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app
    .route('/api/v1/communities/:id')
    // .get(community.userViewById)
    .patch(
      isRequestTokenAuthorized,
      asyncHandler(community.communityUpdateById),
    );

  app
    .route('/api/v1/communities')
    .get(asyncHandler(community.getCommunities))
    .post(isRequestTokenAuthorized, asyncHandler(community.communityCreate));
}
