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
import mongoose from 'mongoose';
import { ServerError } from '../lib/utils.lib';

describe('Authenticate', () => {
  const password = hashPassword('authentication-test');
  beforeEach(async () => {
    await new User({
      username: 'TestDummy',
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: password.hash,
      salt: password.salt,
      authToken: '6a95b47e-c37d-492e-8278-faca6824ada6',
    }).save();
  });

  it('Incorrect password', async () => {
    expect(
      authenticateUser({ email: 'test@dummy.com' }, 'incorrectPassword'),
    ).to.be.rejectedWith(ServerError);
  });

  it('Incorrect username', async () => {
    expect(
      authenticateUser(
        { username: 'IncorrectUsername' },
        'authentication-test',
      ),
    ).to.be.rejectedWith(ServerError);
  });

  it('Incorrect email', async () => {
    expect(
      authenticateUser(
        { email: 'incorrectemail@example.com' },
        'authentication-test',
      ),
    ).to.be.rejectedWith(ServerError);
  });

  it('Correct username and password', async () => {
    const result = await authenticateUser(
      { username: 'TestDummy' },
      'authentication-test',
    );

    expect(result.email).to.equal('test@dummy.com');
    expect(result.username).to.equal('TestDummy');
  });

  it('Correct email and password', async () => {
    const result: any = await authenticateUser(
      { email: 'test@dummy.com' },
      'authentication-test',
    );
    expect(result.email).to.equal('test@dummy.com');
    expect(result.username).to.equal('TestDummy');
  });
});

describe('Login', () => {
  const password = 'passwordtodd';
  const passwordHashed = hashPassword(password);

  beforeEach(async () => {
    await new User({
      username: 'Todd123',
      displayName: 'Todd',
      email: 'todd413@hotmail.com',
      hashedPassword: passwordHashed.hash,
      salt: passwordHashed.salt,
      authToken: '6a95b47e-c37d-492e-8278-faca6824ada6',
    }).save();
  });

  it('Authtoken provided with valid details', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'todd413@hotmail.com',
        plaintextPassword: password,
      })
      .expect(StatusCodes.OK);
    expect(response.body).to.have.property('authToken');
  });

  it('Authtoken not provided invalid details', async () => {
    expect(
      request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'InvalidUsername',
          email: 'todd413@hotmail.com',
          plaintextPassword: password,
        })
        .expect(StatusCodes.NOT_FOUND),
    ).to.be.rejectedWith(ServerError);
  });

  it('Verify isUserAuthorized', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      email: 'todd413@hotmail.com',
      plaintextPassword: password,
    });

    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');
    const userId = new mongoose.Types.ObjectId(loginResponse.body.userID);
    const authToken = loginResponse.body.authToken;
    const authResponse: any = await isUserAuthorized(userId, authToken);
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
    const userId = new mongoose.Types.ObjectId(loginResponse.body.userID);
    const authTokenInvalid = 'invalidAuthToken';

    const authResponse: any = await isUserAuthorized(userId, authTokenInvalid);
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
    const userIdInvalid = new mongoose.Types.ObjectId('invalidUserID');
    const authToken = loginResponse.body.authToken;
    const authResponse: any = await isUserAuthorized(userIdInvalid, authToken);
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
    const userId = new mongoose.Types.ObjectId(loginResponse.body.userID);
    const userAuthTokenResponse = await getUserAuthToken(userId);
    expect(userAuthTokenResponse).lengthOf(16);
  });

  it('getUserAuthToken with invalid userId', async () => {
    const userIdInvalid = new mongoose.Types.ObjectId('invalidUserID');
    const userAuthTokenResponse: any = await getUserAuthToken(userIdInvalid);
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

    const userId = new mongoose.Types.ObjectId(loginResponse.body.userID);
    const authToken = loginResponse.body.authToken;
    const setUserAuthTokenResponse: any = await setUserAuthToken(userId);
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
    const userIdInvalid = new mongoose.Types.ObjectId('invalidUserID');
    const setUserAuthTokenResponse: any = await setUserAuthToken(userIdInvalid);
    expect(setUserAuthTokenResponse.status).equals(StatusCodes.NOT_FOUND);
  });
});
