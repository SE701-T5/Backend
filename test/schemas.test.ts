import {expect} from "chai";
import mongoose from "mongoose";

import User from '../config/db_schemas/user.schema';
import Forum from '../config/db_schemas/forum.schema';
import Comment from '../config/db_schemas/comment.schema';

/**
 * Test successful forum user schema fields exist
 */
describe('Forum user schema test', function() {
    it('should be invalid if required fields are empty', function(done) {
        const f = new User();

        f.validate(function(err: mongoose.Error.ValidationError) {
            expect(err.errors.username).to.exist;
            expect(err.errors.displayName).to.exist;
            expect(err.errors.email).to.exist;
            expect(err.errors.hashedPassword).to.exist;
            expect(err.errors.authToken).to.exist;
            done();
        });
    });
});

/**
 * Test successful forum post schema fields exist
 */
describe('Forum post schema test', function() {
    it('should be invalid if required fields are empty', function(done) {
        const f = new Forum();

        f.validate(function(err: mongoose.Error.ValidationError) {
            expect(err.errors.userID).to.exist;
            expect(err.errors.communityID).to.exist;
            expect(err.errors.title).to.exist;
            expect(err.errors.bodyText).to.exist;
            expect(err.errors.edited).to.exist;
            expect(err.errors.upVotes).to.exist;
            expect(err.errors.downVotes).to.exist;
            done();
        });
    });
});

/**
 * Test successful forum post comment schema fields exist
 */
describe('Comment schema test', function() {
    it('should be invalid if required fields are empty', function(done) {
        const f = new Comment();

        f.validate(function(err: mongoose.Error.ValidationError) {
            expect(err.errors.postID).to.exist;
            expect(err.errors.authorID).to.exist;
            expect(err.errors.authorUserName).to.exist;
            expect(err.errors.bodyText).to.exist;
            expect(err.errors.edited).to.exist;
            expect(err.errors.upVotes).to.exist;
            expect(err.errors.downVotes).to.exist;
            done();
        });
    });
});
