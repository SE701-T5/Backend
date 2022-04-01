import { expect } from 'chai';
import mongoose from 'mongoose';

import User from '../config/db_schemas/user.schema';
import Forum from '../config/db_schemas/post.schema';
import Comment from '../config/db_schemas/comment.schema';

/**
 * Test successful forum user schema fields exist
 */
describe('Schemas', () => {
  describe('User', () => {
    it('Empty fields', () => {
      const user = new User();
      user.validate(function (err: mongoose.Error.ValidationError) {
        expect(err.errors.username).to.exist;
        expect(err.errors.displayName).to.exist;
        expect(err.errors.email).to.exist;
        expect(err.errors.hashedPassword).to.exist;
        expect(err.errors.authToken).to.exist;
      });
    });
  });

  describe('Forum post', () => {
    it('Empty fields', () => {
      const forum = new Forum();
      forum.validate(function (err: mongoose.Error.ValidationError) {
        expect(err.errors.userID).to.exist;
        expect(err.errors.communityID).to.exist;
        expect(err.errors.title).to.exist;
        expect(err.errors.bodyText).to.exist;
        expect(err.errors.edited).to.exist;
        expect(err.errors.upVotes).to.exist;
        expect(err.errors.downVotes).to.exist;
      });
    });
  });

  describe('Comment', () => {
    it('Empty fields', () => {
      const comment = new Comment();
      comment.validate(function (err: mongoose.Error.ValidationError) {
        expect(err.errors.postID).to.exist;
        expect(err.errors.authorID).to.exist;
        expect(err.errors.authorUserName).to.exist;
        expect(err.errors.bodyText).to.exist;
        expect(err.errors.edited).to.exist;
        expect(err.errors.upVotes).to.exist;
        expect(err.errors.downVotes).to.exist;
      });
    });
  });
});
