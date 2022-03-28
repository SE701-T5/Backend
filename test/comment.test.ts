import request from 'supertest';
import app from '../server';
import User from '../config/db_schemas/user.schema';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe.only('Comment', function () {
  let userId, authToken, forumPostId;
  beforeEach(async function () {
    // Create user
    const plaintextPassword = 'authentication-test';
    await new User({
      username: 'TestDummy',
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: hashPassword(plaintextPassword),
      authToken: '6a95b47e-c37d-492e-8278-faca6824ada6',
    }).save();

    // Login
    const loginResponse = await request(app).post('/api/v1/users/login').send({
      username: 'TestDummy',
      email: 'test@dummy.com',
      plaintextPassword: plaintextPassword,
    });
    expect(loginResponse.status).to.equal(StatusCodes.OK);
    expect(loginResponse.body).to.have.property('userID');
    expect(loginResponse.body).to.have.property('authToken');
    userId = loginResponse.body.userID;
    authToken = loginResponse.body.authToken;

    // Create post
    const createPostResponse: any = await request(app)
      .post('/api/v1/posts')
      .set({ 'X-Authorization': authToken })
      .send({
        userID: userId,
        title: "Happy St. Paddy's day!",
        communityID: 'communityID',
        text: "What's the craic?",
        images: ['image string'],
      });

    expect(createPostResponse.status).to.equal(StatusCodes.CREATED);
    expect(createPostResponse.body.forumPostData).to.have.property('_id');
    forumPostId = createPostResponse.body.forumPostData._id;
  });

  it('Create', async function () {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumPostId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.CREATED);
  });

  it('Create (missing authorId)', async function () {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumPostId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.BAD_REQUEST);
  });

  it('Create (invalid length)', async function () {
    const commentReponse = await request(app)
      .post(`/api/v1/posts/${forumPostId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: '',
        bodyText: 'Hi my name is George',
      });
    expect(commentReponse.status).to.equal(StatusCodes.BAD_REQUEST);
  });

  it('View', async function () {
    await request(app)
      .post(`/api/v1/posts/${forumPostId}/comments`)
      .set({ 'X-Authorization': authToken })
      .send({
        authorID: userId,
        username: 'NewUser',
        bodyText: 'Hi my name is George',
      })
      .expect(StatusCodes.CREATED);
    await request(app)
      .get(`/api/v1/posts/${forumPostId}/comments`)
      .expect(StatusCodes.OK);
  });

  it('View (no comments)', async function () {
    await request(app)
      .get(`/api/v1/posts/${forumPostId}/comments`)
      .expect(StatusCodes.OK);
  });

  it('View (bad forumPostId)', async function () {
    await request(app)
      .get(`/api/v1/posts/invalidForumPostId/comments`)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Update (dummy)', async function () {
    // XXX
    await request(app)
      .patch('/api/v1/posts/:id/comments/:id')
      .send({ dummyTestInput: 'this text is useless' })
      .expect({ dummyTest: 'commentUpdateById() dummy test passes' });
  });
});