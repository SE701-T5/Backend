import { expect } from 'chai';
import mongoose from 'mongoose';

import User from '../config/db_schemas/user.schema';
import Post from '../config/db_schemas/post.schema';
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
        expect(err.errors.salt).to.exist;
        expect(err.errors.hashedPassword).to.exist;
      });
    });
  });

  describe('Post', () => {
    it('Empty fields', () => {
      const forum = new Post();
      forum.validate(function (err: mongoose.Error.ValidationError) {
        expect(err.errors.owner).to.exist;
        expect(err.errors.title).to.exist;
        expect(err.errors.community).to.exist;
        expect(err.errors.bodyText).to.exist;
      });
    });
  });

  describe('Comment', () => {
    it('Empty fields', () => {
      const comment = new Comment();
      comment.validate(function (err: mongoose.Error.ValidationError) {
        expect(err.errors.owner).to.exist;
        expect(err.errors.bodyText).to.exist;
      });
    });
  });
});
