import pino from 'pino';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import { Request, Response, NextFunction } from 'express';
import { ServerError } from './utils.lib';
import multer from 'multer';

export function isDevelopment(req: Request, res: Response, next: NextFunction) {
  if (config.get('environment') !== 'development')
    throw new ServerError('endpoint does not exist', 404);
  next();
}

/**
 * Verify if an authorization token exists in the database at API gateway to determine whether to continue or not
 * @param req HTTP request object containing the authorization token for verification
 * @param res HTTP request response status code with message if the verification fails
 * @param next continue to the next function if the status code returned from authorization token verification is 200
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authToken = req.header(config.get('authToken'));

    if (authToken == undefined) throw new ServerError('Unauthorised', 401);

    try {
      await User.searchUserByAuthToken(authToken);
    } catch (err) {
      throw new ServerError('Unauthorised', 401);
    }

    next();
  } catch (err) {
    next(err);
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<unknown>,
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
    logger.error({ msg: 'unhandled error', err, serverError: false });
    err = new ServerError('internal server error', 500, err);
  } else if (err.status === 500) {
    logger.error({ msg: 'unknown server error', err, serverError: false });
  } else {
    logger.warn({ msg: 'server error caught', serverError: true, err });
  }

  // update typings
  const serverError = err as ServerError;

  res.status(serverError.status).send({
    code: serverError.status,
    error: serverError.message,
    context:
      config.get('environment') === 'development'
        ? serverError.context
        : undefined,
  });
}

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '.' + config.get('uploadDestination'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});
