const
    request = require('supertest'),
    app = require('../server');

describe("Create forum comment test", function() {
    it("should return: status 200", function(done) {
        request(app)
            .post('/api/v1/comments')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'userCreate() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});