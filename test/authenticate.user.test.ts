import { expect, should } from 'chai';
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
    return expect(
      authenticateUser({ email: 'test@dummy.com' }, 'incorrectPassword'),
    )
      .to.eventually.be.rejectedWith('incorrect password')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.UNAUTHORIZED);
  });

  it('Incorrect username', async () => {
    return expect(
      authenticateUser(
        { username: 'IncorrectUsername' },
        'authentication-test',
      ),
    )
      .to.eventually.be.rejectedWith('user not found')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.NOT_FOUND);
  });

  it('Incorrect email', async () => {
    return expect(
      authenticateUser(
        { email: 'incorrectemail@example.com' },
        'authentication-test',
      ),
    )
      .to.eventually.be.rejectedWith('user not found')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.NOT_FOUND);
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
    const result = await authenticateUser(
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
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('username', 'Todd123');
    expect(response.body).to.have.property('displayName', 'Todd');
    expect(response.body).to.have.property('email', 'todd413@hotmail.com');
  });

  it('Authtoken not provided invalid details', async () => {
    return expect(
      request(app).post('/api/v1/users/login').send({
        username: 'InvalidUsername',
        email: 'todd413@hotmail.com',
        plaintextPassword: password,
      }),
    ).eventually.have.property('status', StatusCodes.BAD_REQUEST);
  });

  it('Verify isUserAuthorized with username', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'Todd123',
        plaintextPassword: password,
      })
      .expect(StatusCodes.OK);

    const userId = new mongoose.Types.ObjectId(response.body.id);
    const authToken = response.body.authToken;
    return expect(isUserAuthorized(userId, authToken)).eventually.equals(true);
  });

  it('Verify isUserAuthorized with email', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'todd413@hotmail.com',
        plaintextPassword: password,
      })
      .expect(StatusCodes.OK);

    const userId = new mongoose.Types.ObjectId(response.body.id);
    const authToken = response.body.authToken;
    return expect(isUserAuthorized(userId, authToken)).eventually.equals(true);
  });

  it('Verify isUserAuthorized false with invalid authToken', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'todd413@hotmail.com',
      plaintextPassword: 'passwordtodd',
    });

    const userId = new mongoose.Types.ObjectId(response.body.id);
    const authTokenInvalid = 'invalidAuthToken'; // Invalid byte length

    return expect(isUserAuthorized(userId, authTokenInvalid))
      .to.eventually.be.rejectedWith(
        'Input buffers must have the same byte length',
      )
      .and.be.an.instanceOf(RangeError);
  });

  it('Verify isUserAuthorized with valid but unkown ID and valid authentication token', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'todd413@hotmail.com',
        plaintextPassword: password,
      })
      .expect(StatusCodes.OK);

    const invalidUserId = new mongoose.Types.ObjectId(
      '6246cbc0d500fd63778de311',
    ); // Not present in db
    const authToken = response.body.authToken;

    return expect(isUserAuthorized(invalidUserId, authToken))
      .to.eventually.be.rejectedWith('user not found')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.NOT_FOUND);
  });

  it('getUserAuthToken with valid logged-in userId', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'todd413@hotmail.com',
        plaintextPassword: 'passwordtodd',
      })
      .expect(StatusCodes.OK);

    const userId = new mongoose.Types.ObjectId(response.body.id);
    const authToken = await getUserAuthToken(userId);
    expect(authToken).lengthOf(32);
  });

  it('getUserAuthToken with valid but unkown userId', async () => {
    const userIdInvalid = new mongoose.Types.ObjectId(
      '6246cbc0d500fd63778de310',
    );

    return expect(getUserAuthToken(userIdInvalid))
      .to.eventually.be.rejectedWith('user not found')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.NOT_FOUND);
  });

  it('setUserAuthToken with valid and logged-in userId', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      plaintextPassword: 'passwordtodd',
    });

    const userId = new mongoose.Types.ObjectId(loginResponse.body.id);
    const oldAuthToken = loginResponse.body.authToken;
    const setUserAuthTokenResponse = await setUserAuthToken(userId);
    const newAuthToken = setUserAuthTokenResponse.authToken;
    expect(newAuthToken).lengthOf(32);
    expect(oldAuthToken).not.to.equal(newAuthToken);
  });

  it('setUserAuthToken with invalid userId', async () => {
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'Todd123',
      plaintextPassword: 'passwordtodd',
    });
    expect(loginResponse.status).to.equal(StatusCodes.OK);
    const userIdInvalid = new mongoose.Types.ObjectId(
      '6246cbc0d500fd63778de310',
    );
    return expect(setUserAuthToken(userIdInvalid))
      .to.eventually.be.rejectedWith('user not found')
      .and.be.an.instanceOf(ServerError)
      .and.have.property('status', StatusCodes.BAD_REQUEST);
  });
});
