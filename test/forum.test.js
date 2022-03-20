const
    { closeConn, connect } = require("../config/db.server.config"),
    { resetCollections } = require("../models/db.server.model"),
    request = require('supertest'),
    assert = require("assert"),
    app = require('../server');

/**
 * Before all tests, the app database is disconnected before the test database is connected
 */
before(async function() {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

/**
 * Before each test, all data in the test database is deleted
 */
beforeEach(async function() {
    await resetCollections(); // reset database for testing
});

/**
 * After all tests, all test database document data is deleted and the test database is disconnected
 */
after(async function() {
    await resetCollections(); // reset database for testing
    await closeConn(true); // Disconnect from the app database
});

/**
 * Test successfully creating a new forum post with a logged in and authenticated user
 */
describe("Create forum post successfully", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": res.body.authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "How do I make a forum post?!",
                                    communityID: "communityID",
                                    text: "Help me, I don't know how to turn my computer on!",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                done();
                            });
                    });
            });
    });
});

/**
 * Test unsuccessfully creating a new forum post with an invalid authentication token
 */
describe("Create forum post unsuccessfully with an invalid authentication token", function() {
    it("should return: 401", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": 'wrongToken' })
                            .send(
                                {
                                    userID: id,
                                    title: "How do I make a forum post?!",
                                    communityID: "communityID",
                                    text: "Help me, I don't know how to turn my computer on!",
                                    images: ["image string"]
                                })
                            .expect(401)
                            .end(function (err, res) {
                                if (err) done(err);
                                done();
                            });
                    });
            });
    });
});

/**
 * Test unsuccessfully creating a new forum post with a missing userID field
 */
describe("Create forum post unsuccessfully - missing field: userID", function() {
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

/**
 * Test unsuccessfully creating a new forum post with an invalid communityID field
 */
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

/**
 * Test unsuccessfully creating a new forum post with an invalid title field
 */
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

/**
 * A dummy test until the feature is implemented for responding to HTTP GET request with a hardcoded string
 * TODO: fix this test when the forum post view by general search feature is implemented
 */
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

/**
 * Test successfully viewing a forum post
 */
describe("View forum post successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": res.body.authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "How do I make a forum post?!",
                                    communityID: "communityID",
                                    text: "Help me, I don't know how to turn my computer on!",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .get(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .expect(200)
                                    .end(function (err, res) {
                                        if (err) done(err);
                                        done();
                                    });
                            });
                    });
            });
    });
});

/**
 * Test unsuccessfully viewing a forum post with an invalid ID field
 */
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
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id,
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
    });
});

/**
 * Test successful forum post database document update using valid ID for only votes
 */
describe("Update forum post successfully with valid ID for only votes", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id,
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
    });
});

/**
 * Test successful forum post database document update using valid ID for only edits
 */
describe("Update forum post successfully with valid ID for only edits", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id,
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
    });
});

/**
 * Test unsuccessful forum post database document update using invalid authorization token
 */
describe("Update forum post unsuccessfully using invalid authorization token", function() {
    it("should return: 401", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": 'wrongToken' })
                                    .send(
                                        {
                                            userID: id,
                                            title: "A new title",
                                            text: "A new body text"
                                        })
                                    .expect(401)
                                    .end(function(err, res) {
                                        if (err) done(err);
                                        done();
                                    });
                            });
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
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/123`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id,
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
    });
});

/**
 * Test unsuccessful forum post database document update using empty update object
 */
describe("Update forum post unsuccessfully with empty update object", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
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
    });
});

/**
 * Test unsuccessful forum post database document update using invalid communityID update field
 */
describe("Update forum post unsuccessfully with invalid communityID update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
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
    });
});

/**
 * Test unsuccessful forum post database document update using invalid title update field
 */
describe("Update forum post unsuccessfully with invalid title update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
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
    });
});

/**
 * Test unsuccessful forum post database document update using invalid upVotes update field
 */
describe("Update forum post unsuccessfully with invalid upVotes update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
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
    });
});

/**
 * Test unsuccessful forum post database document update using invalid downVotes update field
 */
describe("Update forum post unsuccessfully with invalid downVotes update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .patch(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
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
    });
});

/**
 * A dummy test until the feature is implemented for responding to HTTP PATCH request with a hardcoded string
 * TODO: fix this test when the view forum post comment by ID feature is implemented
 */
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

/**
 * A dummy test until the feature is implemented for responding to HTTP POST request with a hardcoded string
 * TODO: fix this test when the create forum post comment feature is implemented
 */
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

/**
 * A dummy test until the feature is implemented for responding to HTTP PATCH request with a hardcoded string
 * TODO: fix this test when the update forum post comment by ID feature is implemented
 */
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
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .delete(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id
                                        })
                                    .expect(200)
                                    .end(function(err, res) {
                                        if (err) done(err);
                                        done();
                                    });
                            });
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
            .delete(`/api/v1/posts/${ invalidID }`)
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
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .delete(`/api/v1/posts/${ nonExistentValidID }`)
                                    .set({ "X-Authorization": authToken })
                                    .send(
                                        {
                                            userID: id
                                        })
                                    .expect(404)
                                    .end(function(err, res) {
                                        if (err) done(err);
                                        done();
                                    });
                            });
                    });
            });
    });
});

/**
 * Test unsuccessful forum post database document deletion using invalid authorization token
 */
describe("Delete forum post unsuccessfully using invalid authorization token", function() {
    it("should return: 401", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'NewUser',
                displayName: "NewUser",
                email: 'new@user.com',
                plaintextPassword: 'newUser'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'NewUser',
                        email: 'new@user.com',
                        plaintextPassword: 'newUser'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        const authToken = res.body.authToken;
                        request(app)
                            .post('/api/v1/posts')
                            .set({ "X-Authorization": authToken })
                            .send(
                                {
                                    userID: id,
                                    title: "Happy St. Paddy's day!",
                                    communityID: "communityID",
                                    text: "What's the craic?",
                                    images: ["image string"]
                                })
                            .expect(201)
                            .end(function (err, res) {
                                if (err) done(err);
                                request(app)
                                    .delete(`/api/v1/posts/${ res.body.forumPostData._id }`)
                                    .set({ "X-Authorization": 'wrongToken' })
                                    .send(
                                        {
                                            userID: id
                                        })
                                    .expect(401)
                                    .end(function(err, res) {
                                        if (err) done(err);
                                        done();
                                    });
                            });
                    });
            });
    });
});
