const expect = require('chai').expect;
 
var user = require('../config/db_schemas/user.schema');

describe('Forum user schema test', function() {
    it('should be invalid if required fields are empty', function(done) {
        var f = new user();

        f.validate(function(err) {
            expect(err.errors.username).to.exist;
            expect(err.errors.name).to.exist;
            expect(err.errors.email).to.exist;
            expect(err.errors.hashedPassword).to.exist;
            done();
        });
    });
});