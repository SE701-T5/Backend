import { Express } from 'express';
import * as user from '../controllers/user.server.controller';
import { asyncHandler, isRequestTokenAuthorized } from '../lib/middleware.lib';
import multer from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

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
    .post(isRequestTokenAuthorized, asyncHandler(user.userLogout));

  app
    .route('/api/v1/users/current')
    .get(isRequestTokenAuthorized, user.userViewCurrent)
    .put(
      upload.single('profilePicture'),
      isRequestTokenAuthorized,
      user.userUpdateCurrent,
    );

  app
    .route('/api/v1/users/:id')
    .get(user.userViewById)
    .patch(
      upload.single('profilePicture'),
      isRequestTokenAuthorized,
      asyncHandler(user.userUpdateById),
    )
    .delete(isRequestTokenAuthorized, asyncHandler(user.userDeleteById));
}
