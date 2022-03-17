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
            .get('/api/v1/posts/62329bab7ec3446e40e1b2e0')
            .expect(200)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .get('/api/v1/posts/6232994f41c28ff61a79a5b0')
            .expect(200)
            .end(function(err, res) {
                if (err) done(err);
                done();
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
