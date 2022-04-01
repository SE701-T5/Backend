import app from '../server';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import User from '../config/db_schemas/user.schema';
import Post from '../config/db_schemas/post.schema';
import { hashPassword } from '../models/user.server.model';
import { expect } from 'chai';

describe('Forum', () => {
  let userId, authToken, forumId: string;

  beforeEach(async () => {
    // Create user
    const userDoc = await new User({
      username: 'TestDummy',
      displayName: 'MostValuedTest',
      email: 'test@dummy.com',
      hashedPassword: hashPassword('authentication-test'),
      authToken: 'a'.repeat(16), // Valid authTokens are 16chars wide
    }).save();

    userId = userDoc._id;
    authToken = userDoc.authToken;

    // Create forum
    const postDoc = await new Post({
      userID: userId,
      communityID: 'communityId',
      title: 'Dummy forum title',
      bodyText: 'Dummy forum body text',
      edited: false,
      upVotes: 0,
      downVotes: 0,
    }).save();

    forumId = postDoc._id.toString();
  });

  describe('Post', () => {
    it.skip('Create', async () => {
      await request(app)
        .post('/api/v1/posts')
        .set({ 'X-Authorization': authToken })
        .send({
          userID: userId,
          title: 'How do I make a forum post?!',
          communityID: 'communityID',
          text: "Help me, I don't know how to turn my computer on!",
          images: ['image string'],
        })
        .expect(StatusCodes.CREATED);
    });

    it.skip('Create wtih invalid authToken header', async () => {
      await request(app)
        .post('/api/v1/posts')
        .set({ 'X-Authorization': 'invalidAuthToekn' })
        .send({
          userID: userId,
          title: 'How do I make a forum post?!',
          communityID: 'communityID',
          text: "Help me, I don't know how to turn my computer on!",
          images: ['image string'],
        })
        .expect(StatusCodes.FORBIDDEN);
    });

    it.skip('Create missing userId', async () => {
      await request(app)
        .post('/api/v1/posts')
        .set({ 'X-Authorization': authToken })
        .send({
          title: 'How do I make a forum post?!',
          communityID: 'communityID',
          text: "Help me, I don't know how to turn my computer on!",
          images: ['image string'],
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Create with invalid communityId (less than three chars)', async () => {
      await request(app)
        .post('/api/v1/posts')
        .set({ 'X-Authorization': authToken })
        .send({
          title: 'How do I make a forum post?!',
          communityID: 'ab',
          text: "Help me, I don't know how to turn my computer on!",
          images: ['image string'],
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it.skip('Create with 0 char title', async () => {
      await request(app)
        .post('/api/v1/posts')
        .set({ 'X-Authorization': authToken })
        .send({
          title: '',
          communityID: 'communityID',
          text: "Help me, I don't know how to turn my computer on!",
          images: ['image string'],
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    // XXX: Awaiting implementation
    it.skip('Create with 0 char title', async () => {
      await request(app)
        .get('/api/v1/posts')
        .expect({ dummyTest: 'postViews() dummy test passes' });
    });

    it.skip('View', async () => {
      await request(app).get(`/api/v1/posts/${forumId}`).expect(StatusCodes.OK);
    });

    it.skip('View with invalid forumId', async () => {
      await request(app)
        .get(`/api/v1/posts/62328e357ec3446e40e1b29b`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it.skip('Update for edits and votes', async () => {
      const updatePayload = {
        userID: userId,
        title: "No more St. Paddy's day!",
        text: ':(',
        upVotes: 1,
        downVotes: 1,
      };

      const postUpdateResponse: any = await request(app)
        .patch(`/api/v1/posts/${forumId}`)
        .set({ 'X-Authorization': authToken })
        .send(updatePayload);

      expect(postUpdateResponse.body.forumPost.bodyText).equals(
        updatePayload.text,
      );
      expect(postUpdateResponse.body.forumPost.upVotes).equals(
        updatePayload.upVotes,
      );
      expect(postUpdateResponse.body.forumPost.downVotes).equals(
        updatePayload.downVotes,
      );
      expect(postUpdateResponse.body.forumPost.title).equals(
        updatePayload.title,
      );
      expect(postUpdateResponse.body.forumPost.edited).equals(true);
    });
  });

  it.skip('Update for edits and votes', async () => {
    const updatePayload = {
      userID: userId,
      title: "No more St. Paddy's day!",
      text: ':(',
      upVotes: 1,
      downVotes: 1,
    };

    const postUpdateResponse: any = await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send(updatePayload);

    // XXX: make a utility method for partial deep equals. Use this in the future but it has to be tested
    expect(postUpdateResponse.body.forumPost.bodyText).equals(
      updatePayload.text,
    );
    expect(postUpdateResponse.body.forumPost.upVotes).equals(
      updatePayload.upVotes,
    );
    expect(postUpdateResponse.body.forumPost.downVotes).equals(
      updatePayload.downVotes,
    );
    expect(postUpdateResponse.body.forumPost.title).equals(updatePayload.title);
    expect(postUpdateResponse.body.forumPost.edited).equals(true);
  });

  it.skip('Update with invalid authToken', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': 'invalidAuthToken' })
      .send({
        userID: userId,
        title: "No more St. Paddy's day!",
      })
      .expect(StatusCodes.FORBIDDEN);
  });

  it.skip('Update with invalid forumPostId', async () => {
    await request(app)
      .patch(`/api/v1/posts/invalidForumId`)
      .set({ 'X-Authorization': authToken })
      .send({
        userID: userId,
        title: "No more St. Paddy's day!",
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Update with invalid forumPostId', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({})
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Update with invalid forumPostId', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        communityID: '12',
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Update with empty title', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        title: '',
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Update with invalid upVotes/downVotes field', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        upVotes: NaN,
        downvotes: NaN,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Update with invalid upVotes/downVotes field', async () => {
    await request(app)
      .patch(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        upVotes: NaN,
        downvotes: NaN,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it.skip('Delete', async () => {
    await request(app)
      .delete(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        userID: userId,
      })
      .expect(StatusCodes.OK);
  });

  it.skip('Delete with invalid id', async () => {
    const invalidID = 'Ab345678901234567890123'; // one char too short
    await request(app)
      .delete(`/api/v1/posts/${invalidID}`)
      .set({ 'X-Authorization': authToken })
      .send({
        userID: userId,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });
  it.skip('Delete with nonexistant valid id', async () => {
    const nonExistentValidID = '01234e357ec3446e40e1b29b';
    await request(app)
      .delete(`/api/v1/posts/${nonExistentValidID}`)
      .set({ 'X-Authorization': authToken })
      .send({
        userID: userId,
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it.skip('Delete with invalid authToken', async () => {
    await request(app)
      .delete(`/api/v1/posts/${forumId}`)
      .set({ 'X-Authorization': 'invalidAuthToken' })
      .send({
        userID: userId,
      })
      .expect(StatusCodes.FORBIDDEN);
  });
});
