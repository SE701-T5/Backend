const
    request = require('supertest'),
    app = require('../server');
const {closeConn, connect} = require("../config/db.server.config");

beforeEach(async function() {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

describe("Reset database test - remove all documents from all collections", function() {
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
