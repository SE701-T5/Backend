const
    request = require('supertest'),
    app = require('../server');

describe("Reset database dummy test", function() {
    it("should return: { dummyTest: 'resetDB() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/reset')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'resetDB() dummy test passes' })
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