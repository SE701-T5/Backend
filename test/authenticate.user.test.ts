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

/**
 * Test successful user authentication using a matching email login and password
 */
describe('Authenticate', function () {
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

  it('Incorrect username', function (done) {
    authenticateUser(
      { username: 'IncorrectUsername' },
      'authentication-test',
      (result) => {
        expect(result).to.be.false;
        done();
      },
    );
  });

  it('Incorrect email', function (done) {
    authenticateUser(
      { email: 'incorrectemail@example.com' },
      'authentication-test',
      (result) => {
        expect(result).to.be.false;
        done();
      },
    );
  });

  it('Incorrect login details', function (done) {
    authenticateUser(
      { displayName: 'MostValuedTest' },
      'authentication-test',
      (result) => {
        expect(result).to.be.false;
        done();
      },
    );
  });

  it('Correct username and password', function (done) {
    authenticateUser(
      { username: 'TestDummy' },
      'authentication-test',
      (result) => {
        expect(result).to.have.property('res');
        expect(result.res.email).to.equal('test@dummy.com');
        expect(result).to.have.property('status');
        expect(result.status).to.equal(StatusCodes.OK);
        done();
      },
    );
  });

  it('Correct email and password', function (done) {
    authenticateUser(
      { email: 'test@dummy.com' },
      'authentication-test',
      (result) => {
        expect(result).to.have.property('res');
        expect(result.res.email).to.equal('test@dummy.com');
        expect(result).to.have.property('status');
        expect(result.status).to.equal(StatusCodes.OK);
        done();
      },
    );
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

  it.skip('Authtoken not provided invalid details', async function () {
    const response = await request(app).post('/api/v1/users/login').send({
      username: 'InvalidUsername',
      email: 'todd413@hotmail.com',
      plaintextPassword: password,
    });
    expect(response.status).to.equal(StatusCodes.FORBIDDEN);
    expect(response.body).to.not.have.property('authToken');
  });
});

/**
 * Test successful verification of user authentication using a valid user ID and authentication token
 */
describe('Verify user authentication successfully with valid ID and authentication token', function () {
  it('should return: true', async function () {
    const userReponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });
    expect(userReponse.status).to.equal(StatusCodes.CREATED);
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
});

/**
 * Test unsuccessful verification of user authentication using a valid user ID and invalid authentication token
 */
describe('Verify user authentication unsuccessfully with valid ID and invalid authentication token', function () {
  it('should return: true', async function () {
    const userResponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });
    expect(userResponse.status).to.equal(StatusCodes.CREATED);
    // expect(userResponse.body.userData).to.have.property('_id');
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
});

/**
 * Test unsuccessful verification of user authentication using an invalid user ID and valid authentication token
 */
describe('Verify user authentication unsuccessfully with invalid ID and valid authentication token', function () {
  it('should return: true', async function () {
    const userResponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(userResponse.status).to.equal(StatusCodes.CREATED);
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
});

/**
 * Test successful getting of a user authentication token with valid and logged-in user ID
 */
describe('Get user authentication token successfully with valid and logged-in user ID', function () {
  it('should return: authToken', async function () {
    const userResponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(userResponse.status).to.equal(StatusCodes.CREATED);
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
});

/**
 * Test unsuccessful getting of a user authentication token with invalid user ID
 */
describe('Get user authentication token unsuccessfully with invalid user ID', function () {
  it('should return: 404', async function () {
    const userId = 'invalidUserId';
    const userAuthTokenResponse: any = await customPromisify(getUserAuthToken)(
      userId,
    );
    expect(userAuthTokenResponse.status).to.equal(StatusCodes.NOT_FOUND);
  });
});

/**
 * Test successful setting of a user authentication token with valid and logged-in user ID
 */
describe('Set user authentication token successfully with valid and logged-in user ID', function () {
  it('should return: authToken', async function () {
    const userResponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(userResponse.status).to.equal(StatusCodes.CREATED);
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
});

/**
 * Test unsuccessful setting of a user authentication token with invalid user ID
 */
describe('set user authentication token unsuccessfully with invalid user ID', function () {
  it('should return: 404', async function () {
    const userResponse = await request(app).post('/api/v1/users').send({
      username: 'Todd123',
      displayName: 'todd',
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    expect(userResponse.status).to.equal(StatusCodes.CREATED);
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
