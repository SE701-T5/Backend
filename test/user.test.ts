import request from 'supertest';
import app from '../server';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import User from '../config/db_schemas/user.schema';
import { expect } from 'chai';
import { ServerError } from '../lib/utils.lib';

describe('User', () => {
  describe('Create', () => {
    it('Create with displayName', async () => {
      return request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          displayName: 'Bob123',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.CREATED);
    });

    it('Create without displayName', async () => {
      return request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Create with missing email', async () => {
      return request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Create with unmet username length requirement ', async () => {
      return request(app)
        .post('/api/v1/users')
        .send({
          username: 'Yi',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Create and check password hash', async () => {
      const createUserPayload = {
        username: 'Jim123',
        displayName: 'Jim',
        email: 'Jim420@hotmail.com',
        plaintextPassword: 'passwordjim',
      };
      const result = await request(app)
        .post('/api/v1/users')
        .send(createUserPayload);

      expect(result.status).equals(StatusCodes.CREATED);
      expect(result.body.username).equals(createUserPayload.username);
      expect(result.body.displayName).equals(createUserPayload.displayName);
      expect(result.body.email).equals(createUserPayload.email);
    });
  });

  describe('Login', () => {
    let userId, authToken: string;
    let password = 'authentication-test';
    const hashedPassword = hashPassword('authentication-test');

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashedPassword.hash,
        salt: hashedPassword.salt,
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it('Login successfully', async () => {
      return request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@dummy.com',
          plaintextPassword: password,
        })
        .expect(StatusCodes.OK);
    });

    it('Login without required username', async () => {
      return request(app)
        .post('/api/v1/users/login')
        .send({
          plaintextPassword: 'newUser',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Login no password', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@dummy.com',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Login no matching user', async () => {
      return request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'notmatching@dummy.com',
          plaintextPassword: 'notMaching',
        })
        .expect(StatusCodes.NOT_FOUND);
    });

    it('Login non matching password', async () => {
      return request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@dummy.com',
          plaintextPassword: 'notMaching',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('Logout', () => {
    let userId, authToken: string;
    const password = 'authentication-test';
    const hashedPassword = hashPassword(password);

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashedPassword.hash,
        salt: hashedPassword.salt,
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it('Logout successfully', async () => {
      return request(app)
        .post('/api/v1/users/logout')
        .set({ 'X-Authorization': authToken })
        .send({
          userID: userId,
        })
        .expect(StatusCodes.NO_CONTENT);
    });

    it('Logout with invalid authToken', async () => {
      return request(app)
        .post('/api/v1/users/logout')
        .set({ 'X-Authorization': 'invalidAuthToken' })
        .send()
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('View', () => {
    let userId, authToken: string;
    const password = 'authentication-test';
    const hashedPassword = hashPassword(password);

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashedPassword.hash,
        salt: hashedPassword.salt,
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it('View user by userId sucessfully', async () => {
      return request(app)
        .get(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .expect(StatusCodes.OK);
    });

    it.skip('View user using invalid Id', async () => {
      return expect(
        request(app)
          .get(`/api/v1/users/x`)
          .set({ 'X-Authorization': authToken }),
      )
        .to.eventually.be.rejectedWith('id is an invalid format')
        .and.be.an.instanceOf(ServerError)
        .and.have.property('status', StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Update', () => {
    let userId, authToken: string;
    const password = 'authentication-test';
    const hashedPassword = hashPassword(password);

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashedPassword.hash,
        salt: hashedPassword.salt,
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it('Update user with valid userId', async () => {
      const updateUserPayload = {
        username: 'OldBob',
        displayName: 'Bob',
        email: 'joe@bobby.com',
        plaintextPassword: 'JoeBob',
      };

      const updateUserResponse = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send(updateUserPayload)
        .expect(StatusCodes.OK);

      expect(updateUserResponse.body.username).equals(
        updateUserPayload.username,
      );
      expect(updateUserResponse.body.displayName).equals(
        updateUserPayload.displayName,
      );
      expect(updateUserResponse.body.email).equals(updateUserPayload.email);
      expect(updateUserResponse.body.id).equals(userId.toString());
    });

    it('Update user with unsucessfully with invalid authToken', async () => {
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': 'invalidAuthToken' })
        .send({
          username: 'OldBob',
          displayName: 'Bob',
          email: 'joe@bobby.com',
          plaintextPassword: 'JoeBob',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('Update user with unsucessfully with valid wrong authToken', async () => {
      const validAuthToken = '62328e357ec0006e40e1b29b';
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': validAuthToken })
        .send({
          username: 'OldBob',
          displayName: 'Bob',
          email: 'joe@bobby.com',
          plaintextPassword: 'JoeBob',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('Update user with unsucessfully with invalid Id', async () => {
      return request(app)
        .patch(`/api/v1/users/invalidUserId`)
        .set({ 'X-Authorization': authToken })
        .send({
          username: 'OldBob',
          displayName: 'Bob',
          email: 'joe@bobby.com',
          plaintextPassword: 'JoeBob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Update user with invalid username', async () => {
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ username: 'yo' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Update user with invalid displayName', async () => {
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ displayName: 'yo' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Update user with invalid email', async () => {
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ email: 'invalid email' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Update user with invalid password', async () => {
      return request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ password: '' })
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Delete', () => {
    let userId, authToken: string;
    const password = 'authentication-test';
    const hashedPassword = hashPassword(password);

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashedPassword.hash,
        salt: hashedPassword.salt,
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it('Delete user', async () => {
      return request(app)
        .delete(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .expect(StatusCodes.NO_CONTENT);
    });

    it('Delete user invalid authToken', async () => {
      return request(app)
        .delete(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': 'invalidToken' })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
