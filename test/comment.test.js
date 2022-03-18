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
                postID: '001',
                authorID: 'GeorgeClooney',
                authorDisplayName: 'gerogy',
                bodytext: 'Hi my name is George'
                date: '17-03-2022',
                upVotes: 0',
                downVotes: 0
            })
            .expect(200, done);
    });
});

// describe("Create forum user test unsuccessfully - missing attribute 'email'", function() {
//     it("should return: status 400", function(done) {
//         request(app)
//             .post('/api/v1/users')
//             .send({
//                 username: 'Tim123',
//                 displayName: 'Tim',
//                 password: 'passwordtim'
//             })
//             .expect(400)
//             .end(function(err, res) {
//                 if (err) done(err);
//                 done();
//             });
//     });
// });