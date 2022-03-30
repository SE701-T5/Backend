import { expect } from 'chai';
import { describe } from 'mocha';
import User from '../config/db_schemas/user.schema';
import {
  authenticateUser,
  isUserAuthorized,
  getUserAuthToken,
  setUserAuthToken,
} from '../models/user.server.model';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../server';
import { customPromisify } from './global-fixtures';

describe('Authenticate', () => {
  beforeEach(async () => {
    await new User({
      username: 'TestDummy',
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: hashPassword('authentication-test'),
      authToken: '6a95b47e-c37d-492e-8278-faca6824ada6',
    }).save();
  });

  it('Incorrect password', async () => {
    const result = await customPromisify(authenticateUser)(
      { email: 'test@dummy.com' },
      'incorrectPassword',
    );
    expect(result).to.be.false;
  });

  it('Incorrect username', async () => {
    const result = await customPromisify(authenticateUser)(
      { username: 'IncorrectUsername' },
      'authentication-test',
    );
    expect(result).to.be.false;
  });

  it('Incorrect email', async () => {
    const result = await customPromisify(authenticateUser)(
      { email: 'incorrectemail@example.com' },
      'authentication-test',
    );
    expect(result).to.be.false;
  });

  it('Incorrect login details', async () => {
    const result = await customPromisify(authenticateUser)(
      { displayName: 'MostValuedTest' },
      'authentication-test',
    );
    expect(result).to.be.false;
  });

  it('Correct username and password', async () => {
    const result: any = await customPromisify(authenticateUser)(
      { username: 'TestDummy' },
      'authentication-test',
    );

    expect(result).to.have.property('res');
    expect(result.res.email).to.equal('test@dummy.com');
    expect(result).to.have.property('status');
    expect(result.status).to.equal(StatusCodes.OK);
  });

  it('Correct email and password', async () => {
    const result: any = await customPromisify(authenticateUser)(
      { email: 'test@dummy.com' },
      'authentication-test',
    );
    expect(result).to.have.property('res');
    expect(result.res.email).to.equal('test@dummy.com');
    expect(result).to.have.property('status');
    expect(result.status).to.equal(StatusCodes.OK);
  });
});

describe('Login', () => {
  const password = 'passwordtodd';

  beforeEach(async () => {
    await new User({
      username: 'Todd123',
      displayName: 'Todd',
      email: 'todd413@hotmail.com',
      hashedPassword: hashPassword(password),
      authToken: '6a95b47e-c37d-492e-8278-faca6824ada6',
    }).save();
  });

  it('Authtoken provided with valid details', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'todd413@hotmail.com',
      plaintextPassword: password,
    });
    expect(response.status).to.equal(StatusCodes.OK);
    expect(response.body).to.have.property('authToken');
  });

  // XXX: Original test expected 403 Forbidden but this is functionality is found nowhere in userLogin
  it('Authtoken not provided invalid details', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      username: 'InvalidUsername',
      email: 'todd413@hotmail.com',
      plaintextPassword: password,
    });
    expect(response.status).to.equal(StatusCodes.NOT_FOUND);
    expect(response.body).to.not.have.property('authToken');
  });

  it('Verify isUserAuthorized', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });
    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');
    const userId = loginResponse.body.userID;
    const authToken = loginResponse.body.authToken;
    const authResponse: any = await customPromisify(isUserAuthorized)(
      userId,
      authToken,
    );
    expect(authResponse).to.have.property('isAuth');
    expect(authResponse.isAuth).to.be.true;
  });

  it('Verify isUserAuthorized false with invalid authToken', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');
    const userId = loginResponse.body.userID;
    const authTokenInvalid = 'invalidAuthToken';

    const authResponse: any = await customPromisify(isUserAuthorized)(
      userId,
      authTokenInvalid,
    );
    expect(authResponse).to.have.property('isAuth');
    expect(authResponse.isAuth).to.be.false;
  });

  it('Verify isUserAuthorized with invalid ID and valid authentication token', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');
    const userIdInvalid = 'invalidUserID';
    const authToken = loginResponse.body.authToken;
    const authResponse: any = await customPromisify(isUserAuthorized)(
      userIdInvalid,
      authToken,
    );
    expect(authResponse).to.have.property('isAuth');
    expect(authResponse.isAuth).to.be.false;
  });

  it('getUserAuthToken with valid logged-in userId', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    const userId = loginResponse.body.userID;
    const userAuthTokenResponse = await customPromisify(getUserAuthToken)(
      userId,
    );
    expect(userAuthTokenResponse).lengthOf(16);
  });

  it('getUserAuthToken with invalid userId', async () => {
    const userId = 'invalidUserId';
    const userAuthTokenResponse: any = await customPromisify(getUserAuthToken)(
      userId,
    );
    expect(userAuthTokenResponse.status).to.equal(StatusCodes.NOT_FOUND);
  });

  it('setUserAuthToken with valid and logged-in userId', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });
    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');

    const userId = loginResponse.body.userID;
    const authToken = loginResponse.body.authToken;
    const setUserAuthTokenResponse: any = await customPromisify(
      setUserAuthToken,
    )(userId);
    const newAuthToken = setUserAuthTokenResponse.res;
    expect(newAuthToken).lengthOf(16);
    expect(authToken).not.to.equal(newAuthToken);
  });

  it('setUserAuthToken with invalid userId', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });
    expect(loginResponse.status).to.equal(StatusCodes.OK);
    const invalidUserId = 'invalidUserId';
    const setUserAuthTokenResponse: any = await customPromisify(
      setUserAuthToken,
    )(invalidUserId);
    expect(setUserAuthTokenResponse.status).equals(StatusCodes.NOT_FOUND);
  });
});
