import request from 'supertest';
import app from '../server';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import User from '../config/db_schemas/user.schema';
import { expect } from 'chai';

describe('User', () => {
  describe('Create', () => {
    it('Create without displayName', async () => {
      request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.CREATED);
    });

    it.skip('Create with displayName', async () => {
      request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          displayName: 'Bob123',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.CREATED);
    });

    it.skip('Create with missing email', async () => {
      request(app)
        .post('/api/v1/users')
        .send({
          username: 'Bob123',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Create with unmet username length requirement ', async () => {
      request(app)
        .post('/api/v1/users')
        .send({
          username: 'Yi',
          email: 'bob420@hotmail.com',
          plaintextPassword: 'passwordbob',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Create and check password hash', async () => {
      const createUserPayload = {
        username: 'Jim123',
        email: 'Jim420@hotmail.com',
        plaintextPassword: 'passwordjim',
      };
      const createUserRequest = await request(app)
        .post('/api/v1/users')
        .send(createUserPayload)
        .expect(StatusCodes.CREATED);

      expect(createUserRequest.body.userData.res.hashedPassword).equals(
        hashPassword(createUserPayload.plaintextPassword),
      );
    });
  });

  describe('Login', () => {
    let userId, authToken: string;
    let password = 'authentication-test';

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashPassword(password),
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it.skip('Login successfully', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'Dummy username',
          email: 'test@dummy.com',
          plaintextPassword: password,
        })
        .expect(StatusCodes.OK);
    });

    it.skip('Login without required username', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          plaintextPassword: 'newUser',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Login no password', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'Dummy username',
          email: 'test@dummy.com',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Login no matching user', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'Not matching',
          email: 'notmatching@dummy.com',
          plaintextPassword: 'notMaching',
        })
        .expect(StatusCodes.NOT_FOUND);
    });

    // XXX: This status code should be changed to a more appropriate status code like FORBIDDEN
    it.skip('Login non matching password', async () => {
      await request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'Dummy username',
          plaintextPassword: 'notMaching',
        })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('Logout', () => {
    let userId, authToken: string;
    let password = 'authentication-test';

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashPassword(password),
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it.skip('Logout successfully', async () => {
      request(app)
        .post('/api/v1/users/logout')
        .set({ 'X-Authorization': authToken })
        .send({
          userID: userId,
        })
        .expect(StatusCodes.OK);
    });

    // XXX: These should really be UNAUTHORIZED but the login auth guard middleware is return this first
    // before the api has the chance to return UNAUTHORIZED. Similar goes for other cases like this in
    // the suite.
    it.skip('Logout with invalid authToken', async () => {
      request(app)
        .post('/api/v1/users/logout')
        .set({ 'X-Authorization': 'invalidAuthToken' })
        .send({
          userID: userId,
        })
        .expect(StatusCodes.FORBIDDEN);
    });

    it.skip('Logout with invalid userId', async () => {
      request(app)
        .post('/api/v1/users/logout')
        .set({ 'X-Authorization': authToken })
        .send({
          userID: 'wrong ID',
        })
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('View', () => {
    let userId, authToken: string;
    let password = 'authentication-test';

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashPassword(password),
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it.skip('View user by userId sucessfully', async () => {
      request(app)
        .get(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .expect(StatusCodes.OK);
    });

    it.skip('View user using invalid Id', async () => {
      request(app)
        .get(`/api/v1/users/x`)
        .set({ 'X-Authorization': authToken })
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Update', () => {
    let userId, authToken: string;
    let password = 'authentication-test';

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashPassword(password),
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it.skip('Update user with valid userId', async () => {
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
        .expect(StatusCodes.CREATED);

      // XXX: Hellish chain
      expect(updateUserResponse.body.updatedForumUser.res.username).equals(
        updateUserPayload.username,
      );
      expect(updateUserResponse.body.updatedForumUser.res.displayName).equals(
        updateUserPayload.displayName,
      );
      expect(updateUserResponse.body.updatedForumUser.res.email).equals(
        updateUserPayload.email,
      );
      expect(
        updateUserResponse.body.updatedForumUser.res.hashedPassword,
      ).equals(hashPassword(updateUserPayload.plaintextPassword));
    });

    // Same as previously in this suite, picked up early by authGuard; should be UNAUTHORISED instead
    it.skip('Update user with unsucessfully with invalid authToken', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': 'invalidAuthToken' })
        .send({
          username: 'OldBob',
          displayName: 'Bob',
          email: 'joe@bobby.com',
          plaintextPassword: 'JoeBob',
        })
        .expect(StatusCodes.FORBIDDEN);
    });

    it.skip('Update user with unsucessfully with valid wrong authToken', async () => {
      const validAuthToken = '62328e357ec0006e40e1b29b';
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': validAuthToken })
        .send({
          username: 'OldBob',
          displayName: 'Bob',
          email: 'joe@bobby.com',
          plaintextPassword: 'JoeBob',
        })
        .expect(StatusCodes.NOT_FOUND);
    });

    it.skip('Update user with unsucessfully with invalid Id', async () => {
      request(app)
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

    it.skip('Update user with unsucessfully with empty update object', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({})
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Update user with invalid username', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ username: 'yo' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Update user with invalid displayName', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ displayName: 'A' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Update user with invalid email', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ email: 'invalid email' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Update user with invalid password', async () => {
      request(app)
        .patch(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .send({ password: '' })
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Delete', () => {
    let userId, authToken: string;
    let password = 'authentication-test';

    beforeEach(async () => {
      const userDoc = await new User({
        username: 'Dummy username',
        displayName: 'Dummy displayName',
        email: 'test@dummy.com',
        hashedPassword: hashPassword(password),
        authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
      }).save();

      userId = userDoc._id;
      authToken = userDoc.authToken;
    });

    it.skip('Delete user', async () => {
      request(app)
        .delete(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': authToken })
        .expect(StatusCodes.OK);
    });

    it.skip('Delete user invalid authToken', async () => {
      request(app)
        .delete(`/api/v1/users/${userId}`)
        .set({ 'X-Authorization': 'invalidToken' })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
