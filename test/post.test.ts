import app from '../server';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import User from '../config/db_schemas/user.schema';
import Post from '../config/db_schemas/post.schema';
import Community from '../config/db_schemas/community.schema';
import { hashPassword } from '../models/user.server.model';
import { expect } from 'chai';

describe('Forum', () => {
  let userId, authToken, communityId, postId: string;

  const password = 'authentication-test';
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

    // Create Community
    const communityDoc = await new Community({
      owner: userId,
      name: 'Dummy name',
      description: 'Dummy description',
    }).save();

    communityId = communityDoc._id;

    // Create post
    const postDoc = await new Post({
      owner: userDoc._id,
      community: communityDoc._id,
      title: 'Dummy forum title',
      bodyText: 'Dummy forum body text',
      edited: false,
      upVotes: 0,
      downVotes: 0,
    }).save();

    postId = postDoc._id.toString();
  });

  describe('Post', () => {
    it('Create', async () => {
      return request(app)
        .post(`/api/v1/communities/${communityId}/posts`)
        .set({ 'X-Authorization': authToken })
        .send({
          title: 'Forum post title',
          bodyText: 'asdfasd',
          attachments: [],
        })
        .expect(StatusCodes.CREATED);
    });

    it('Create wtih invalid authToken header', async () => {
      return request(app)
        .post(`/api/v1/communities/${communityId}/posts`)
        .set({ 'X-Authorization': 'invalidAuthToekn' })
        .send({
          title: 'How do I make a forum post?!',
          bodyText: "Help me, I don't know how to turn my computer on!",
          attachments: ['image string'],
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('Create with invalid communityId (less than three chars)', async () => {
      return request(app)
        .post(`/api/v1/communities/xxx/posts`)
        .set({ 'X-Authorization': authToken })
        .send({
          title: 'How do I make a forum post?!',
          bodyText: "Help me, I don't know how to turn my computer on!",
          attachments: ['image string'],
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('Create with 0 char title', async () => {
      return request(app)
        .post(`/api/v1/communities/xxx/posts`)
        .set({ 'X-Authorization': authToken })
        .send({
          title: '',
          bodyText: "Help me, I don't know how to turn my computer on!",
          attachments: ['image string'],
        })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('View', async () => {
      return request(app)
        .get(`/api/v1/communities/${communityId}/posts`)
        .expect(StatusCodes.OK);
    });

    it('View with valid but unkown communityId', async () => {
      return expect(
        request(app).get(`/api/v1/communities/62328e355ec3446e40e1b29c/posts`),
      ).to.eventually.have.property('statusCode', StatusCodes.NOT_FOUND);
    });

    it('Update for edits and votes', async () => {
      const updatePayload = {
        title: "No more St. Paddy's day!",
        bodyText: 'asdf',
        upVotes: 1,
      };

      const postUpdateResponse = await request(app)
        .patch(`/api/v1/posts/${postId}`)
        .set({ 'X-Authorization': authToken })
        .send(updatePayload);

      expect(postUpdateResponse.body.upVotes).equals(updatePayload.upVotes);
      expect(postUpdateResponse.body.title).equals(updatePayload.title);
      expect(postUpdateResponse.body.bodyText).equals(updatePayload.bodyText);
      expect(postUpdateResponse.body.edited).equals(true);
    });
  });

  it('Update with invalid authToken', async () => {
    return request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': 'invalidAuthToken' })
      .send({
        title: "No more St. Paddy's day!",
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it('Update with invalid forumPostId', async () => {
    return request(app)
      .patch(`/api/v1/posts/invalidForumId`)
      .set({ 'X-Authorization': authToken })
      .send({
        title: "No more St. Paddy's day!",
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Update with empty title', async () => {
    return request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        title: '',
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Update with xored up/down votes field', async () => {
    return request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        upVotes: NaN,
        downvotes: NaN,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Update with invalid votes field', async () => {
    return request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': authToken })
      .send({
        upVotes: NaN,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Delete', async () => {
    return request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': authToken })
      .send()
      .expect(StatusCodes.NO_CONTENT);
  });

  it('Delete with invalid id', async () => {
    const invalidID = 'Ab345678901234567890123'; // one char too short
    return request(app)
      .delete(`/api/v1/posts/${invalidID}`)
      .set({ 'X-Authorization': authToken })
      .send()
      .expect(StatusCodes.BAD_REQUEST);
  });
  it('Delete with nonexistant valid id', async () => {
    const nonExistentValidID = '01234e357ec3446e40e1b29b';
    return request(app)
      .delete(`/api/v1/posts/${nonExistentValidID}`)
      .set({ 'X-Authorization': authToken })
      .send()
      .expect(StatusCodes.NOT_FOUND);
  });

  it('Delete with invalid authToken', async () => {
    return request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set({ 'X-Authorization': 'invalidAuthToken' })
      .send({})
      .expect(StatusCodes.UNAUTHORIZED);
  });
});
