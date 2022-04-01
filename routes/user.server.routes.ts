import { Express } from 'express';
import * as user from '../controllers/user.server.controller';
import { isRequestTokenAuthorized } from '../lib/middleware.lib';
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
    .post(upload.single('profilePicture'), user.userCreate);

  app.route('/api/v1/users/login').post(user.userLogin);

  app
    .route('/api/v1/users/logout')
    .post(isRequestTokenAuthorized, user.userLogout);

  app
    .route('/api/v1/users/current')
    .get(user.userViewCurrent)
    .put(upload.single('profilePicture'), user.userUpdateCurrent);

  app
    .route('/api/v1/users/:id')
    .get(user.userViewById)
    .patch(
      upload.single('profilePicture'),
      isRequestTokenAuthorized,
      user.userUpdateById,
    )
    .delete(isRequestTokenAuthorized, user.userDeleteById);
}
