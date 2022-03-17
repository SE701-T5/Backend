const
    { closeConn, connect } = require("../config/db.server.config"),
    request = require('supertest'),
    app = require('../server');

beforeEach(async function() {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

describe("Create forum post successfully", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "Bob",
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
                    userID: "Bob",
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
                    userID: "Bob",
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
                    userID: "Same Ole Bob",
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

describe("Update forum post by ID dummy test", function() {
    it("should return: { dummyTest: 'postUpdateById() dummy test passes' }", function(done) {
        request(app)
            .patch('/api/v1/posts/:id')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'postUpdateById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
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

describe("Create forum post comment dummy test", function() {
    it("should return: { dummyTest: 'commentGiveById() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/posts/:id/comments')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'commentGiveById() dummy test passes' })
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

/**
 * Test successful forum post database document deletion using existing and valid ID
 */
describe("Delete forum post successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send(
                {
                    userID: "Bob",
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
