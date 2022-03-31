import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import { Request, Response, NextFunction } from 'express';
import { ServerError } from './utils.lib';

/**
 * Verify if an authorization token exists in the database at API gateway to determine whether to continue or not
 * @param req HTTP request object containing the authorization token for verification
 * @param res HTTP request response status code with message if the verification fails
 * @param next continue to the next function if the status code returned from authorization token verification is 200
 */
export async function isRequestTokenAuthorized(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log('started auth');
  const authToken = req.header(config.get('authToken'));

  try {
    await User.searchUserByAuthToken(authToken);
  } catch (err) {
    throw new ServerError('Unauthorised', 401, err);
  }

  next();
}
