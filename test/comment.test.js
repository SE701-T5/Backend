const
    request = require('supertest'),
    app = require('../server');

beforeEach(async function () {
    const testDatabaseName = process.env.DATABASE_TEST_NAME;
    await closeConn(); // Disconnect from the app database
    await connect(testDatabaseName, true); // Connect to the test database
});

describe("Create forum comment test", function () {
    it("should return: status 201", function (done) {
        request(app)
            .post('/api/v1/comments')
            .send({
                username: 'Dave123',
                name: 'dave',
                dave: '17-03-2022',
                content: 'This is the moment.'
            })
            .expect(200, done);
    });
});