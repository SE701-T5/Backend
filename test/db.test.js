const
    { closeConn, connect } = require("../config/db.server.config"),
    request = require('supertest'),
    app = require('../server');

/**
 * Before each test, the app database is disconnected before the test database is connected
 */
beforeEach(async function() {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

/**
 * Test successful deletion of all collection documents from test database
 */
describe("Successfully reset database test - remove all documents", function() {
    it("should return: 200 'OK'", function(done) {
        request(app)
            .post('/api/v1/reset')
            .expect(200)
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

/**
 * Test unsuccessful deletion of collection documents from disconnected test database
 */
describe("Unsuccessfully reset database test - database is not connected", function() {
    it("should return: 500", function(done) {
        closeConn(true) // Disconnect from the test database
            .then(() => {
                request(app)
                    .post('/api/v1/reset')
                    .expect(500)
                    .end(function(err, res) {
                        if (err) done(err);
                        done();
                    });
            });
    });
});

describe("Resample database dummy test", function() {
    it("should return: { dummyTest: 'resampleDB() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/resample')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'resampleDB() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});
