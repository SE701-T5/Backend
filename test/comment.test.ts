import request from 'supertest';
import app from '../server';
import User from '../config/db_schemas/user.schema';
import Post from '../config/db_schemas/post.schema';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';
import { ServerError } from '../lib/utils.lib';

describe('Comment', () => {
  let userId, authToken, postId: string;

  const password = 'authentication-test';
  const passwordHash = hashPassword(password);
  beforeEach(async () => {
    // Create user
    const username = 'TestDummy';
    const userDoc = await new User({
      username: username,
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: passwordHash.hash,
      salt: passwordHash.salt,
      authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
    }).save();

    userId = userDoc._id.toString();
    authToken = userDoc.authToken;

    // Create forum
    const postDoc = await new Post({
      owner: userId,
      community: userId,
      title: 'title',
      bodyText: 'bodyText',
      edited: false,
      upVotes: 0,
      downVotes: 0,
    }).save();

    postId = postDoc._id.toString();
  });

  it('Create', async () => {
    return expect(
      request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set({ 'X-Authorization': authToken })
        .send({
          bodyText: 'Hi my name is George',
        }),
    ).to.eventually.have.property('status', StatusCodes.CREATED);
  });

  it('Create (missing authToken)', async () => {
    return expect(
      request(app).post(`/api/v1/posts/${postId}/comments`).send({
        bodyText: 'Hi my name is George',
      }),
    ).to.eventually.have.property('status', StatusCodes.UNAUTHORIZED);
  });

  it('Create (invalid length)', async () => {
    return expect(
      request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set({ 'X-Authorization': authToken })
        .send({
          bodyText: '',
        }),
    ).to.eventually.have.property('status', StatusCodes.BAD_REQUEST);
  });

  it('View', async () => {
    await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        bodyText: 'Hi my name is George',
      })
      .expect(StatusCodes.CREATED);

    return expect(
      request(app).get(`/api/v1/posts/${postId}/comments`),
    ).to.eventually.have.property('status', StatusCodes.OK);
  });

  it('View (no comments)', async () => {
    return expect(
      request(app).get(`/api/v1/posts/${postId}/comments`),
    ).to.eventually.have.property('status', StatusCodes.OK);
  });

  it('View (bad postId)', async () => {
    return expect(
      request(app).get(`/api/v1/posts/badPostId/comments`),
    ).to.eventually.have.property('status', StatusCodes.BAD_REQUEST);
  });

  // TODO: Not sure why not working; 404 on update endpoint
  it('Update', async () => {
    const response = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        bodyText: 'Hi my name is George',
      })
      .expect(StatusCodes.CREATED);

    const commentId = response.body.id;

    return expect(
      request(app)
        .post(`/api/v1/comments/${commentId}`)
        .set({ 'X-Authorization': authToken })
        .send({
          bodyText: 'updated',
          upVotes: 5,
          attachments: ['asdf'],
        }),
    ).to.eventually.have.property('status', StatusCodes.OK);
  });
});
