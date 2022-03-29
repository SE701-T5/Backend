import request from 'supertest';
import app from '../server';
import User from '../config/db_schemas/user.schema';
import Forum from '../config/db_schemas/forum.schema';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe('Comment', () => {
  let userId, authToken, forumId: string;

  beforeEach(async () => {
    // Create user
    const username = 'TestDummy';
    const userDoc = await new User({
      username: username,
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: hashPassword('authentication-test'),
      authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
    }).save();

    userId = userDoc._id;
    authToken = userDoc.authToken;

    // Create forum
    const forumDoc = await new Forum({
      userID: userId,
      communityID: userId,
      title: 'asdf',
      bodyText: 'hasdfasd',
      edited: false,
      upVotes: 0,
      downVotes: 0,
    }).save();

    forumId = forumDoc._id.toString();
  });

  it('Create', async () => {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.CREATED);
  });

  it('Create (missing authorId)', async () => {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.BAD_REQUEST);
  });

  it('Create (invalid length)', async () => {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: '',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.BAD_REQUEST);
  });

  it('View', async () => {
    await request(app)
      .post(`/api/v1/posts/${forumId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      })
      .expect(StatusCodes.CREATED);
    await request(app)
      .get(`/api/v1/posts/${forumId}/comments`)
      .expect(StatusCodes.OK);
  });

  it('View (no comments)', async () => {
    await request(app)
      .get(`/api/v1/posts/${forumId}/comments`)
      .expect(StatusCodes.OK);
  });

  it('View (bad forumPostId)', async () => {
    await request(app)
      .get(`/api/v1/posts/invalidForumPostId/comments`)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Update (dummy)', async () => {
    // XXX: Test uses dummy data
    await request(app)
      .patch('/api/v1/posts/:id/comments/:id')
      .send({ dummyTestInput: 'this text is useless' })
      .expect({ dummyTest: 'commentUpdateById() dummy test passes' });
  });
});
