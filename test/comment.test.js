const
    { closeConn, connect } = require("../config/db.server.config"),
    request = require('supertest'),
    app = require('../server');
const {resetCollections} = require("../models/db.server.model");

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
 * Test successfully creating a new forum post comment to a blog post
 */
describe("Create forum comment test successfully", function () {
    it("should return: status 201", function (done) {
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
                            .set({"X-Authorization": authToken})
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
                                    .post(`/api/v1/posts/${ res.body.forumPostData._id }/comments`)
                                    .set({"X-Authorization": authToken})
                                    .send({
                                        authorID: id,
                                        username: 'NewUser',
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
    });
});

/**
 * Test unsuccessfully creating a new forum post comment to a blog post - missing field 'authorID'
 */
describe("Create forum comment test unsuccessfully - missing field 'authorID'", function () {
    it("should return: status 400", function (done) {
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
                            .set({"X-Authorization": authToken})
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
                                    .post(`/api/v1/posts/${ res.body.forumPostData._id }/comments`)
                                    .set({"X-Authorization": authToken})
                                    .send({
                                        username: 'NewUser',
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
    });
});

/**
 * Test unsuccessfully creating a new forum post comment to a blog post - field length too short 'username'
 */
describe("Create forum comment test unsuccessfully - field length requirement not met", function () {
    it("should return: status 400", function (done) {
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
                            .set({"X-Authorization": authToken})
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
                                    .post(`/api/v1/posts/${ res.body.forumPostData._id }/comments`)
                                    .set({"X-Authorization": authToken})
                                    .send({
                                        authorID: id,
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
    });
});

describe("View forum post comment by ID successfully", function() {
    it("should return: status 200", function (done) {
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
                            .set({"X-Authorization": authToken})
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
                                    .post(`/api/v1/posts/${ res.body.forumPostData._id }/comments`)
                                    .set({"X-Authorization": authToken})
                                    .send({
                                        authorID: id,
                                        username: 'NewUser',
                                        bodyText: 'Hi my name is George2'
                                    })
                                    .expect(201)
                                    .end(function (err, res) {
                                        if (err) done(err);
                                        request(app)
                                            .get(`/api/v1/posts/${ res.body.comment.postID }/comments`)
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
