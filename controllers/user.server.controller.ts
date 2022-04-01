import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import {
  convertToObjectId,
  ServerError,
  TypedRequestBody,
} from '../lib/utils.lib';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import { validators, validate } from '../lib/validate.lib';
import { StatusCodes } from 'http-status-codes';

interface UserResponseDTO {
  id: mongoose.Types.ObjectId;
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
  const rules = Joi.object<CreateUserDTO>({
    username: validators.username().required(),
    displayName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    plaintextPassword: validators.password().required(),
  });

  const formData = validate(rules, req.body);

  const user = await User.createUser(formData);
  res.status(201).json({
    id: user._id,
    displayName: user.displayName,
    email: user.email,
    username: user.username,
    authToken: user.authToken,
  });
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
  const rules = Joi.object<LoginDTO>({
    username: validators.username(),
    email: Joi.string().email(),
    plaintextPassword: validators.password().required(),
  }).xor('username', 'email');

  const data = validate(rules, req.body);
  const login: User.LoginInfoDTO = {
    email: data.email,
    username: data.username,
  };

  const user = await User.authenticateUser(login, data.plaintextPassword, true);
  res.status(StatusCodes.OK).send({
    id: user._id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    authToken: user.authToken,
  });
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

  res.status(204).send();
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
  const id = convertToObjectId(req.params.id);
  const user = await User.searchUserById(id);

  res.status(StatusCodes.OK).send({
    id: user._id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
  });
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

  const schema = Joi.object<UpdateUserDTO>({
    username: validators.username(),
    displayName: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    plaintextPassword: validators.password(),
  }).min(1);

  const data = validate(schema, req.body);

  const id = convertToObjectId(req.params.id);
  if (await User.isUserAuthorized(id, authToken)) {
    const user = await User.updateUserById(id, data);
    res.status(StatusCodes.OK).send({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    });
  } else {
    throw new ServerError('forbidden', StatusCodes.FORBIDDEN);
  }
}

/**
 * Delete the data of an existing forum user matching a given ID using HTTP request object data
 * @param req HTTP request object containing the user ID and authorization token for verification
 * @param res HTTP request response status code with message for whether in error or success
 */
export async function userDeleteById(req: Request, res: Response) {
  const authToken = req.get(config.get('authToken'));
  const id = convertToObjectId(req.params.id);

  if (await User.isUserAuthorized(id, authToken)) {
    await User.deleteUserById(id);
    res.status(204).send();
  } else {
    throw new ServerError('forbidden', StatusCodes.FORBIDDEN);
  }
}
