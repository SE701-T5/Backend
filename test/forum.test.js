const
    request = require('supertest'),
    app = require('../server');

describe("Create forum post dummy test", function() {
    it("should return: { dummyTest: 'postViews() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/posts')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'postCreate() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post(s) by search dummy test", function() {
    it("should return: { dummyTest: 'postViews() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/posts')
            .expect({ dummyTest: 'postViews() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post by ID dummy test", function() {
    it("should return: { dummyTest: 'postViewById() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/posts/:id')
            .expect({ dummyTest: 'postViewById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Update forum post by ID dummy test", function() {
    it("should return: { dummyTest: 'postUpdateById() dummy test passes' }", function(done) {
        request(app)
            .patch('/api/v1/posts/:id')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'postUpdateById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("View forum post comment by ID dummy test", function() {
    it("should return: { dummyTest: 'commentViewById() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/posts/:id/comments')
            .expect({ dummyTest: 'commentViewById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Create forum post comment dummy test", function() {
    it("should return: { dummyTest: 'commentGiveById() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/posts/:id/comments')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'commentGiveById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
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
