const
    { closeConn, connect } = require("../config/db.server.config"),
    { resetCollections } = require("../models/db.server.model"),
    {
        authenticateUser,
        isUserAuthorized,
        getUserAuthToken,
        setUserAuthToken
    } = require("../models/user.server.model"),
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
 * Test successful user authentication using a matching email login and password
 */
describe("Authenticate user successfully with matching email and password", function() {
    it("should return: true", function(done) {
        const
            email = 'test@dummy.com',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'TestDummy',
                displayName: 'MostValuedTest',
                email: email,
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ email: email }, password, function (result) {
                    assert.equal(result.email === email && result.hashedPassword === password, true);
                    done();
                });
            });
    });
});

/**
 * Test successful user authentication using a matching email login and password
 */
describe("Authenticate user successfully with matching username and password", function() {
    it("should return: true", function(done) {
        const
            username = 'TestDummy',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: username,
                displayName: 'MostValuedTest',
                email: 'test@dummy.com',
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ username: username }, password, function (result) {
                    assert.equal(result.username === username && result.hashedPassword === password, true);
                    done();
                });
            });
    });
});

/**
 * Test successful user authentication using a matching email and username login and password
 */
describe("Authenticate user successfully with matching email and username and password", function() {
    it("should return: true", function(done) {
        const
            username = 'TestDummy',
            email = 'test@dummy.com',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: username,
                displayName: 'MostValuedTest',
                email: email,
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ username: username, email: email }, password, function (result) {
                    console.log(result._id);
                    assert.equal(result.email === email &&
                        result.username === username && result.hashedPassword === password, true);
                    done();
                });
            });
    });
});

/**
 * Test unsuccessful user authentication using a non-matching email but matching password
 */
describe("Authenticate user unsuccessfully with non-matching email but matching password", function() {
    it("should return: true", function(done) {
        const
            correctEmail = 'test@dummy.com',
            incorrectEmail = 'tst@fummy.com',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'TestDummy',
                displayName: 'MostValuedTest',
                email: correctEmail,
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ email: incorrectEmail }, password, function (result) {
                    assert.equal(result, false);
                    done();
                });
            });
    });
});

/**
 * Test unsuccessful user authentication using a non-matching username but matching password
 */
describe("Authenticate user unsuccessfully with non-matching username but matching password", function() {
    it("should return: true", function(done) {
        const
            correctUsername = 'TestDummy',
            incorrectUsername = 'TstDummy',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: correctUsername,
                displayName: 'MostValuedTest',
                email: 'test@dummy.com',
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ username: incorrectUsername }, password, function (result) {
                    assert.equal(result, false);
                    done();
                });
            });
    });
});

/**
 * Test unsuccessful user authentication using a non-matching username but matching email and password
 */
describe("Authenticate user unsuccessfully with non-matching username but matching email and password", function() {
    it("should return: true", function(done) {
        const
            correctUsername = 'TestDummy',
            incorrectUsername = 'TstDummy',
            email = 'test@dummy.com',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: correctUsername,
                displayName: 'MostValuedTest',
                email: email,
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ email: email, username: incorrectUsername }, password, function (result) {
                    assert.equal(result, false);
                    done();
                });
            });
    });
});

/**
 * Test unsuccessful user authentication using a matching displayName and matching password
 */
describe("Authenticate user unsuccessfully with matching displayName and matching password", function() {
    it("should return: true", function(done) {
        const
            displayName = 'MostValuedTest',
            password = 'authentication-test';
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'TestDummy',
                displayName: displayName,
                email: 'test@dummy.com',
                password: password
            })
            .expect(201)
            .end(function(err, res) {
                if (err) done(err);
                authenticateUser({ displayName: displayName }, password, function (result) {
                    assert.equal(result, false);
                    done();
                });
            });
    });
});

/**
 * Test successful verification of user authentication using a valid user ID and authentication token
 */
describe("Verify user authentication successfully with valid ID and authentication token", function() {
    it("should return: true", function(done) {
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
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        isUserAuthorized(id, res.body.authToken, function(result) {
                            assert.equal(result.isAuth, true);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test unsuccessful verification of user authentication using a valid user ID and invalid authentication token
 */
describe("Verify user authentication unsuccessfully with valid ID and invalid authentication token", function() {
    it("should return: true", function(done) {
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
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        isUserAuthorized(id, 'wrongToken', function(result) {
                            assert.equal(result.isAuth, false);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test unsuccessful verification of user authentication using an invalid user ID and valid authentication token
 */
describe("Verify user authentication unsuccessfully with invalid ID and valid authentication token", function() {
    it("should return: true", function(done) {
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
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        isUserAuthorized('wrongID', res.body.authToken, function(result) {
                            assert.equal(result.isAuth, false);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test successful getting of a user authentication token with valid and logged-in user ID
 */
describe("Get user authentication token successfully with valid and logged-in user ID", function() {
    it("should return: authToken", function(done) {
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
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        getUserAuthToken(id, function(result) {
                            assert.equal(result.length === 16, true);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test unsuccessful getting of a user authentication token with invalid user ID
 */
describe("Get user authentication token unsuccessfully with invalid user ID", function() {
    it("should return: 404", function(done) {
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
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        getUserAuthToken('wrong ID', function(result) {
                            assert.equal(result.status, 404);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test successful setting of a user authentication token with valid and logged-in user ID
 */
describe("Set user authentication token successfully with valid and logged-in user ID", function() {
    it("should return: authToken", function(done) {
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
                const id = res.body.userData._id;
                request(app)
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        setUserAuthToken(id, function(result) {
                            assert.equal(result.authToken.length === 16, true);
                            done();
                        });
                    });
            });
    });
});

/**
 * Test unsuccessful setting of a user authentication token with invalid user ID
 */
describe("set user authentication token unsuccessfully with invalid user ID", function() {
    it("should return: 404", function(done) {
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
                    .post('/api/v1/users/login')
                    .send({
                        username: 'Todd123',
                        email: 'todd413@hotmail.com',
                        password: 'passwordtodd'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) done(err);
                        setUserAuthToken('wrong ID', function(result) {
                            assert.equal(result.status, 404);
                            done();
                        });
                    });
            });
    });
});
