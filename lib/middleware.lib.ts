import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import express, { Request, Response, NextFunction } from 'express';
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

export function asyncHandler(
  fn: (req: Request, res: Response, next?: NextFunction) => unknown,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!(err instanceof ServerError)) {
    err = new ServerError('internal server error', 500, err);
  }

  // update typings
  const serverError = err as ServerError;

  res.status(serverError.status).send({
    code: serverError.status,
    error: serverError.desc,
    context:
      config.get('environment') === 'development'
        ? JSON.stringify(serverError.context)
        : undefined,
  });
}
