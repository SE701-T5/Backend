const expect = require('chai').expect;
 
var forum = require('../config/db_schemas/forum.schema');
 
describe('Forum post schema test', function() {
    it('should be invalid if required fields are empty', function(done) {
        var f = new forum();
 
        f.validate(function(err) {
            expect(err.errors.userID).to.exist;
            expect(err.errors.title).to.exist;
            expect(err.errors.bodyText).to.exist;
            expect(err.errors.editted).to.exist;
            expect(err.errors.upVotes).to.exist;
            expect(err.errors.downVotes).to.exist;
            done();
        });
    });
});