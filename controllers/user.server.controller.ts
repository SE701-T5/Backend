import emailValidator from 'email-validator';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ServerError, TypedRequestBody } from '../lib/utils.lib';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import {
  isValidDocumentID,
  isFieldsValid,
  IValidation,
  getValidValues,
} from '../lib/validate.lib';

interface UserResponseDTO {
  username: string;
  displayName: string;
  email: string;
  authToken?: string;
}

interface LoginDTO {
  plaintextPassword: string;
  email?: string;
  username?: string;
}

/**
 * Creates a new forum user using HTTP request object data
 * @param req HTTP request object containing the data used for creating a new forum user document in the database
 * @param res HTTP request response object status code and user data in JSON format, or error message
 */
export async function userCreate(
  req: TypedRequestBody<CreateUserDTO>,
  res: Response<UserResponseDTO>,
) {
  const forumUserParams: IValidation<CreateUserDTO> = {
    username: {
      valid: req.body.username.length > 2,
      value: req.body.username,
    },
    displayName: {
      valid: req.body.displayName.length > 2,
      value: req.body.displayName,
    },
    email: {
      valid: emailValidator.validate(req.body.email),
      value: req.body.email,
    },
    plaintextPassword: {
      valid: req.body.plaintextPassword.length > 0,
      value: req.body.plaintextPassword,
    },
  };

  if (isFieldsValid(forumUserParams)) {
    const params = getValidValues(forumUserParams);

    const user = await User.createUser(params);
    res.status(201).json({
      displayName: user.displayName,
      email: user.email,
      username: user.username,
      authToken: user.authToken,
    });
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Logs in an authenticated forum user using HTTP request object data
 * @param req HTTP request object containing the user login (email or username) and password for authentication
 * @param res HTTP request response object status code and user ID and authorization token, or error message
 */
export async function userLogin(
  req: TypedRequestBody<LoginDTO>,
  res: Response<UserResponseDTO>,
) {
  const validateParams: IValidation<LoginDTO> = {
    plaintextPassword: {
      value: req.body.plaintextPassword,
      valid: req.body.plaintextPassword.length > 0,
    },
    username: {
      value: req.body.username,
      required: true,
      valid: req.body.username.length > 2 || req.body.email != undefined,
    },
    email: {
      value: req.body.email,
      required: true,
      valid:
        emailValidator.validate(req.body.email) ||
        req.body.username != undefined,
    },
  };

  if (isFieldsValid(validateParams)) {
    const params = getValidValues(validateParams);

    const login: User.LoginInfoDTO = params.email
      ? { email: params.email }
      : { username: params.username };

    const user = await User.authenticateUser(
      login,
      params.plaintextPassword,
      true,
    );
    res.status(200).send({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      authToken: user.authToken,
    });
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Logs out an authenticated logged-in forum user matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum user ID, and authorization token for verification
 * @param res HTTP request response status code and message
 */
export async function userLogout(req: Request, res: Response) {
  const authToken = req.get(config.get('authToken'));

  const user = await User.searchUserByAuthToken(authToken);
  await User.removeUserAuthToken(user._id);

  res.status(201).send();
}

/**
 * Responds to HTTP request with user document data matching a given user ID
 * @param req HTTP request object containing user ID and authorization token for verification
 * @param res HTTP request response status code and user data in JSON format or error message
 */
export async function userViewById(
  req: Request,
  res: Response<UserResponseDTO>,
) {
  const id = req.params.id;

  if (isValidDocumentID(id)) {
    const user = await User.searchUserById(new mongoose.Types.ObjectId(id));
    res.status(200).send({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    });
  } else {
    throw new ServerError('bad request', 400, { id });
  }
}

/**
 * Modifies the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object containing the user fields being updated, user ID and auth token for verification
 * @param res HTTP request response object status code and updated user data in JSON format or error message
 */
export async function userUpdateById(
  req: TypedRequestBody<UpdateUserDTO>,
  res: Response<UserResponseDTO>,
) {
  const authToken = req.get(config.get('authToken'));

  // Set fields for updating to an object with either passed values or false to declare them as invalid
  const userUpdateParams: IValidation<UpdateUserDTO> = {
    username: {
      valid: req.body.username.length > 2,
      required: false,
      value: req.body.username,
    },
    displayName: {
      valid: req.body.displayName.length > 2,
      required: false,
      value: req.body.displayName,
    },
    email: {
      valid: emailValidator.validate(req.body.email),
      required: false,
      value: req.body.email,
    },
    plaintextPassword: {
      valid: req.body.plaintextPassword.length > 0,
      required: false,
      value: req.body.plaintextPassword,
    },
  };

  if (isFieldsValid(userUpdateParams) && isValidDocumentID(req.params.id)) {
    const params = getValidValues(userUpdateParams);
    const id = new mongoose.Types.ObjectId(req.params.id);

    if (await User.isUserAuthorized(id, authToken)) {
      const user = await User.updateUserById(id, params);
      res.status(200).send({
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      });
    } else {
      throw new ServerError('forbidden', 403);
    }
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Delete the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object containing the user ID and authorization token for verification
 * @param res HTTP request response status code with message for whether in error or success
 */
export async function userDeleteById(req: Request, res: Response) {
  const authToken = req.get(config.get('authToken'));

  if (isValidDocumentID(req.params.id)) {
    const id = new mongoose.Types.ObjectId(req.params.id);

    if (await User.isUserAuthorized(id, authToken)) {
      await User.deleteUserById(id);
      res.status(204).send();
    } else {
      throw new ServerError('forbidden', 403);
    }
  } else {
    throw new ServerError('bad request', 400);
  }
}
