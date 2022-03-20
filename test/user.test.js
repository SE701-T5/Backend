const
    { closeConn, connect } = require("../config/db.server.config"),
    { resetCollections } = require("../models/db.server.model"),
    { hashPassword } = require("../models/user.server.model")
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

/**
 * Test successful forum user database document creation without a displayName input
 */
describe("Create forum user successfully without displayName", function() {
    it("should return: status 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Bob123',
                email: 'bob420@hotmail.com',
                password: 'passwordbob'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test successful forum user database document creation with a displayName input
 */
describe("Create forum user successfully with displayName", function() {
    it("should return: status 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Gary143',
                displayName: "Gary",
                email: 'gary283@hotmail.com',
                password: 'passwordgary'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test forum user database document is created unsuccessfully when there is a missing attribute
 */
describe("Create forum user test unsuccessfully - missing attribute 'email'", function() {
    it("should return: status 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Tim123',
                password: 'passwordtim'
            })
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test forum user database document is created unsuccessfully when an attribute does not
 * meet the length requirement
 */
describe("Create forum user test unsuccessfully - attribute length requirement not met", function() {
    it("should return: status 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Yi',
                email: 'yi14123@gmail.com',
                password: 'passwordtim'
            })
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test successful password hashing when a forum user document is created
 */
describe("Test password hashing works correctly", function() {
    it("should return: status 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Jim123',
                email: 'Jim420@hotmail.com',
                password: 'passwordjim'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                assert.equal(res.body.user.hashedPassword, hashPassword("passwordjim"));
                done();
            });
    });
});

describe("Log in forum user dummy test", function() {
    it("should return: { dummyTest: 'userLogin() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/users/login')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'userLogin() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Log out forum user dummy test", function() {
    it("should return: { dummyTest: 'userLogout() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/users/logout')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'userLogout() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum user by ID successfully", function() {
    it("should return: status 200", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: 'Bob1234',
                    displayName: 'bob',
                    email: 'bob420@hotmail.com',
                    password: 'passwordbob'
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .get(`/api/v1/users/${res.body.user._id}`)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

describe("View forum user by ID unsuccessfully with invalid ID", function() {
    it('should return a 400 response for invalid id',function(done) {
        request(app)
            .get('/api/v1/users/x')
            .expect(400)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });

    });
});

/**
 * Test successful forum user database document update using valid ID
 */
describe("Update forum user successfully with valid ID", function() {
    it("should return: 201", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
                    .send(
                        {
                            username: "OldBob",
                            displayName: "Bob",
                            email: "joe@bobby.com",
                            password: "JoeBob"
                        })
                    .expect(201)
                    .end(function(err, res) {
                        if (err) done(err);
                        assert.equal(res.body.updatedForumUser.username, "OldBob");
                        assert.equal(res.body.updatedForumUser.displayName, "Bob");
                        assert.equal(res.body.updatedForumUser.email, "joe@bobby.com");
                        assert.equal(res.body.updatedForumUser.hashedPassword, hashPassword("JoeBob"));
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum user database document update using valid but un-matching ID
 */
describe("Update forum user unsuccessfully with valid but un-matching ID", function() {
    it("should return: 404", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/62328e357ec0006e40e1b29b`)
                    .send(
                        {
                            username: "WrongBob",
                            displayName: "NotFound",
                            email: "what@email.com",
                            password: "password"
                        })
                    .expect(404)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

/**
 * Test unsuccessful forum user database document update using invalid ID
 */
describe("Update forum user unsuccessfully with invalid ID", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/abc`)
                    .send(
                        {
                            username: "NewBob",
                            displayName: "Bobby",
                            email: "bobby@joe.com",
                            password: "BobbyJoe"
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
 * Test unsuccessful forum user database document update using empty update object
 */
describe("Update forum user unsuccessfully with empty update object", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
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
 * Test unsuccessful forum user database document update using invalid username update field
 */
describe("Update forum user unsuccessfully with invalid username update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
                    .send(
                        {
                            "username": "yo"
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
 * Test unsuccessful forum user database document update using invalid displayName update field
 */
describe("Update forum user unsuccessfully with invalid displayName update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
                    .send(
                        {
                            "displayName": "A"
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
 * Test unsuccessful forum user database document update using invalid email update field
 */
describe("Update forum user unsuccessfully with invalid email update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
                    .send(
                        {
                            "email": "not an email"
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
 * Test unsuccessful forum user database document update using invalid password update field
 */
describe("Update forum user unsuccessfully with invalid password update field", function() {
    it("should return: 400", function(done) {
        request(app)
            .post('/api/v1/users')
            .send(
                {
                    username: "NewBob",
                    displayName: "Bobby",
                    email: "bobby@joe.com",
                    password: "BobbyJoe"
                })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .patch(`/api/v1/users/${res.body.user._id}`)
                    .send(
                        {
                            "password": ""
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
 * Test successful forum user database document deletion using existing and valid ID
 */
 describe("Delete forum user successfully", function() {
    it("should return: 200", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'Todd123',
                displayName: 'todd',
                email: 'todd413@hotmail.com',
                password: 'passwordtodd'
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                request(app)
                    .delete(`/api/v1/users/${res.body.user._id}`)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});