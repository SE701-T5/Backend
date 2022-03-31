import * as Crypto from 'crypto';
import { DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import User, { IUser, UserDocument } from '../config/db_schemas/user.schema';
import { getProp, ServerError } from '../lib/utils.lib';

export interface CreateUserDTO {
  username: string;
  displayName: string;
  email: string;
  plaintextPassword: string;
}

export interface UpdateUserDTO
  extends Partial<Omit<IUser, 'hashedPassword' | 'salt'>> {
  plaintextPassword?: string;
}

export interface LoginInfoDTO {
  username?: string;
  email?: string;
}

interface HashedPassword {
  hash: string;
  salt: string;
}

/**
 * Hashes a given plaintext password
 * @param plaintextPassword plaintext password for hashing
 * @returns {String} hashed password
 */
export function hashPassword(plaintextPassword: string): HashedPassword {
  const salt = Crypto.randomBytes(16).toString('hex');
  const hash = Crypto.scryptSync(plaintextPassword, salt, 64).toString('hex');

  return { hash, salt };
}

export function checkPassword(
  plainPassword: string,
  hash: HashedPassword,
): boolean {
  const plainHash = Crypto.scryptSync(plainPassword, hash.salt, 64);
  const storedHash = Buffer.from(hash.hash, 'hex');
  return Crypto.timingSafeEqual(plainHash, storedHash);
}

/**
 * Creates and returns a new forum user using the userSchema
 * @param params object containing forum user attributes
 */
export async function createUser(params: CreateUserDTO): Promise<UserDocument> {
  const hashedPassword = hashPassword(params.plaintextPassword);

  const newUser = new User({
    username: params.username,
    displayName: params.displayName,
    email: params.email,
    hashedPassword: hashedPassword.hash,
    salt: hashedPassword.salt,
  });

  try {
    return await newUser.save();
  } catch (err) {
    if (getProp(err, 'code') === 11000)
      throw new ServerError('conflict', 409, err);
    throw err;
  }
}

/**
 * Search for a user document in the user collections of the database with a matching _id field
 * @param id the user ID for matching with a _id field in the database
 */
export async function searchUserById(id: mongoose.Types.ObjectId) {
  const resource = await User.findById(id);

  if (resource != null) return resource;
  else {
    throw new ServerError('user not found', 404);
  }
}

/**
 * Search for a user document in the user collections of the database with a matching authToken field
 * @param authToken the authorization token for matching with an authToken field in the database
 */
export async function searchUserByAuthToken(
  authToken: string,
): Promise<UserDocument> {
  const resource = await User.findOne({ authToken });

  if (resource != null) return resource;
  else {
    throw new ServerError('user not found', 404);
  }
}

/**
 * Delete an existing forum user matching a given ID
 * @param id the ID for matching to the database document being deleted
 */
export async function deleteUserById(
  id: mongoose.Types.ObjectId,
): Promise<DeleteResult> {
  const result = await User.deleteOne({ _id: id });

  if (result.deletedCount === 0)
    throw new ServerError('not found', 404, result);

  return result;
}

/**
 * Updates given fields of a database collection document for a user matching a given ID
 * @param id the ID of the document being updated
 * @param updates the document field(s) being updated
 */
export async function updateUserById(
  id: mongoose.Types.ObjectId,
  updates: UpdateUserDTO,
): Promise<UserDocument> {
  const calculatedUpdates: Partial<IUser> = updates;

  if ('plaintextPassword' in updates) {
    const hashedPassword = hashPassword(updates.plaintextPassword);
    calculatedUpdates.hashedPassword = hashedPassword.hash;
    calculatedUpdates.salt = hashedPassword.salt;
    calculatedUpdates.authToken = null;
  }

  const resource = await User.findOneAndUpdate(
    { _id: id },
    { $set: calculatedUpdates },
    { new: true },
  );

  if (resource != null) {
    return resource;
  } else {
    throw new ServerError('forum not found', 400);
  }
}

/**
 * Authenticates a user by searching for any existing user in the database with a matching provided login and password
 * @param login the given { login-type: login-value } being matched with a login of any existing user in the database
 * @param plaintextPassword the given password being matched with the password of an existing user matched by the given login
 * @param forceNewAuthToken if set to true, will always generate a new auth-token. Otherwise, will only create if none exist
 */
export async function authenticateUser(
  login: LoginInfoDTO,
  plaintextPassword: string,
  forceNewAuthToken?: boolean,
): Promise<UserDocument> {
  const res = await User.findOne({
    $or: [{ username: login.username }, { email: login.email }],
  }).exec();

  if (res == null) throw new ServerError('user not found', 404, login);

  const hashedPassword: HashedPassword = {
    hash: res.hashedPassword,
    salt: res.salt,
  };
  if (checkPassword(plaintextPassword, hashedPassword)) {
    // User has successfully authenticated
    if (res.authToken == null || forceNewAuthToken) {
      return await setUserAuthToken(res._id);
    }

    return res;
  } else {
    throw new ServerError('incorrect password', 401);
  }
}

/**
 * Gets the authorization token of a user if the user exists in the database and is logged-in
 * @param userID the user ID for matching with a _id field in the database
 */
export async function getUserAuthToken(
  userID: mongoose.Types.ObjectId,
): Promise<string | undefined> {
  const user = await searchUserById(userID);
  return user.authToken;
}

/**
 * Sets the authorization token of a user if the user exists in the database and has logged in
 * @param userID the user ID for matching with a _id field in the database
 */
export async function setUserAuthToken(
  userID: mongoose.Types.ObjectId,
): Promise<UserDocument> {
  const authToken = Crypto.randomBytes(16).toString('hex');

  return await updateUserById(userID, { authToken });
}

/**
 * Verify if a user exists in the database and is currently authorized to access, store and modify database data
 * @param userID the user ID for matching with a _id field in the database
 * @param authToken the authorization token for matching with an authToken field in the database
 */
export async function isUserAuthorized(
  userID: mongoose.Types.ObjectId,
  authToken: string,
): Promise<boolean> {
  const user = await searchUserById(userID);

  if (user.authToken == null)
    throw new ServerError('forbidden', 403, 'no auth token found on user');

  const dbAuthToken = Buffer.from(user.authToken, 'hex');
  const providedAuthToken = Buffer.from(authToken, 'hex');

  return Crypto.timingSafeEqual(dbAuthToken, providedAuthToken);
}

/**
 * Resets the authorization token of a user to unauthorized, if the user exists in the database and is logged in
 * @param userID the user ID for matching with a _id field in the database
 */
export async function removeUserAuthToken(
  userID: mongoose.Types.ObjectId,
): Promise<void> {
  await updateUserById(userID, { authToken: null });
}
