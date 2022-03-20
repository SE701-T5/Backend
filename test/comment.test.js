const
    { closeConn, connect } = require("../config/db.server.config"),
    request = require('supertest'),
    app = require('../server');

/**
 * Before all tests, the app database is disconnected before the test database is connected
 */
beforeEach(async function () {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

/**
 * Test successfully creating a new forum post comment to a blog post
 */
describe("Create forum comment test successfully", function () {
    it("should return: status 201", function (done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "How do I make a forum post?!",
                    communityID: "communityID",
                    text: "Help me, I don't know how to turn my computer on!",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .post(`/api/v1/posts/${ res.body.forumPost._id }/comments`)
                    .send({
                        authorID: "12345678901234567890abcd",
                        authorUserName: 'GeorgeClooney',
                        username: 'gerogy',
                        bodyText: 'Hi my name is George'
                    })
                    .expect(201)
                    .end(function (err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessfully creating a new forum post comment to a blog post - missing field 'authorID'
 */
describe("Create forum comment test unsuccessfully - missing field 'authorID'", function () {
    it("should return: status 400", function (done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "How do I make a forum post?!",
                    communityID: "communityID",
                    text: "Help me, I don't know how to turn my computer on!",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .post(`/api/v1/posts/${ res.body.forumPost._id }/comments`)
                    .send({
                        authorUserName: 'GeorgeClooney',
                        username: 'gerogy',
                        bodyText: 'Hi my name is George'
                    })
                    .expect(400)
                    .end(function (err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessfully creating a new forum post comment to a blog post - field length too short 'username'
 */
describe("Create forum comment test unsuccessfully - field length requirement not met", function () {
    it("should return: status 400", function (done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "How do I make a forum post?!",
                    communityID: "communityID",
                    text: "Help me, I don't know how to turn my computer on!",
                    images: ["image string"]
                })
            .expect(201)
            .end(function (err, res) {
                if (err) done(err);
                request(app)
                    .post(`/api/v1/posts/${ res.body.forumPost._id }/comments`)
                    .send({
                        authorID: "12345678901234567890abcd",
                        authorUserName: 'GeorgeClooney',
                        username: '',
                        bodyText: 'Hi my name is George'
                    })
                    .expect(400)
                    .end(function (err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

describe("View forum post comment by ID dummy test", function() {
    it("should return: { dummyTest: 'commentViewById() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/posts/:id/comments')
            .expect({ dummyTest: 'commentViewById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Update forum post comment by ID dummy test", function() {
    it("should return: { dummyTest: 'commentUpdateById() dummy test passes' }", function(done) {
        request(app)
            .patch('/api/v1/posts/:id/comments/:id')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'commentUpdateById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});
