const
    request = require('supertest'),
    app = require('../server');

describe("Create forum comment test", function () {
    it("should return: status 200", function (done) {
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