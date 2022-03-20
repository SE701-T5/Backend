const
    { closeConn, connect } = require("../config/db.server.config"),
    { resetCollections } = require("../models/db.server.model"),
    request = require('supertest'),
    assert = require("assert"),
    app = require('../server');

beforeEach(async function() {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
    await resetCollections(); // reset database for testing
});

after(async function() {
    await resetCollections(); // reset database for testing
    await closeConn(true); // Disconnect from the app database
});

describe("Create forum post successfully", function() {
    it("should return: 201", function(done) {
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
                done();
            });
    });
});

describe("Create forum post unsuccessfully - missing attribute: userID", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    title: "How do I learn to read?",
                    communityID: "communityID",
                    text: "I really don't understand the words I have just typed, truly",
                    images: ["image string"]
                })
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Create forum post unsuccessfully - communityID less than 3 chars", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "How do I learn to read?",
                    communityID: "ab",
                    text: "I really don't understand the words I have just typed, truly",
                    images: ["image string"]
                })
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Create forum post unsuccessfully - title less than 1 char", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "",
                    communityID: "communityID",
                    text: "I really don't understand the words I have just typed, truly",
                    images: ["image string"]
                })
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post(s) by search dummy test", function() {
    it("should return: { dummyTest: 'postViews() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/posts')
            .expect({ dummyTest: 'postViews() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "More spam day!",
                    communityID: "communityID",
                    text: "Click bait",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .get(`/api/v1/posts/${res.body.forumPost._id}`)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

describe("View forum post unsuccessfully for invalid id", function() {
    it("should return: 400", function(done) {
        request(app)
            .get('/api/v1/posts/xxx')
            .expect(404)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post unsuccessfully for invalid id", function() {
    it("should return: 400", function(done) {
        request(app)
            .get('/api/v1/posts/62328e357ec3446e40e1b29b')
            .expect(404)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test successful forum post database document update using valid ID for edits and votes
 */
describe("Update forum post successfully with valid ID for edits and votes", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            title: "No more St. Paddy's day!",
                            text: ":(",
                            downVotes: 1
                        })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) done(err);
                        assert.equal(res.body.forumPost.title, "No more St. Paddy's day!");
                        assert.equal(res.body.forumPost.bodyText, ":(");
                        assert.equal(res.body.forumPost.downVotes, 1);
                        assert.equal(res.body.forumPost.edited, true);
                        done();
                    });
            });
    });
});

/**
 * Test successful forum post database document update using valid ID for only votes
 */
describe("Update forum post successfully with valid ID for only votes", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            upVotes: 1,
                            downVotes: 1000
                        })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) done(err);
                        assert.equal(res.body.forumPost.upVotes, 1);
                        assert.equal(res.body.forumPost.downVotes, 1000);
                        assert.equal(res.body.forumPost.edited, false);
                        done();
                    });
            });
    });
});

/**
 * Test successful forum post database document update using valid ID for only edits
 */
describe("Update forum post successfully with valid ID for only edits", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            title: "A new title",
                            text: "A new body text"
                        })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) done(err);
                        assert.equal(res.body.forumPost.title, "A new title");
                        assert.equal(res.body.forumPost.bodyText, "A new body text");
                        assert.equal(res.body.forumPost.edited, true);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using invalid ID
 */
describe("Update forum post unsuccessfully with invalid ID", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/123`)
                    .send(
                        {
                            title: "A new title",
                            text: "A new body text"
                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using empty update object
 */
describe("Update forum post unsuccessfully with empty update object", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {

                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using invalid communityID update field
 */
describe("Update forum post unsuccessfully with invalid communityID update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            "communityID": "12"
                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using invalid title update field
 */
describe("Update forum post unsuccessfully with invalid title update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            "title": ""
                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using invalid upVotes update field
 */
describe("Update forum post unsuccessfully with invalid upVotes update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            "upVotes": NaN
                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document update using invalid downVotes update field
 */
describe("Update forum post unsuccessfully with invalid downVotes update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/posts/${res.body.forumPost._id}`)
                    .send(
                        {
                            "downVotes": NaN
                        })
                    .expect(400)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test successful forum post database document deletion using existing and valid ID
 */
describe("Delete forum post successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "12345678901234567890abcd",
                    title: "Happy St. Paddy's day!",
                    communityID: "communityID",
                    text: "What's the craic?",
                    images: ["image string"]
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .delete(`/api/v1/posts/${res.body.forumPost._id}`)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document deletion using invalid ID
 */
describe("Delete forum post unsuccessfully - invalid ID", function() {
    it("should return: 400", function(done) {
        const invalidID = "Ab345678901234567890123"; // one char too short
        request(app)
            .delete(`/api/v1/posts/${invalidID}`)
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test unsuccessful forum post database document deletion using non-existent valid ID
 */
describe("Delete forum post unsuccessfully - ID doesn't exist in DB", function() {
    it("should return: 404", function(done) {
        const nonExistentValidID = "01234e357ec3446e40e1b29b"; // hopefully this will never exist :D
        request(app)
            .delete(`/api/v1/posts/${nonExistentValidID}`)
            .expect(404)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});
