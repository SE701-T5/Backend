const
    request = require('supertest'),
    app = require('../server');

describe("Create forum user dummy test", function() {
    it("should return: { dummyTest: 'userCreate() dummy test passes' }", function(done) {
        request(app)
            .post('/api/v1/users')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'userCreate() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
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

describe("View forum user by ID dummy test", function() {
    it("should return: { dummyTest: 'userViewById() dummy test passes' }", function(done) {
        request(app)
            .get('/api/v1/users/:id')
            .expect({ dummyTest: 'userViewById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});

describe("Update forum user by ID dummy test", function() {
    it("should return: { dummyTest: 'userUpdateById() dummy test passes' }", function(done) {
        request(app)
            .patch('/api/v1/users/:id')
            .send({ dummyTestInput: 'this text is useless' })
            .expect({ dummyTest: 'userUpdateById() dummy test passes' })
            .end(function(err, res) {
                if (err) done(err);
                done();
            });
    });
});
