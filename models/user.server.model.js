const User = require("../config/db_schemas/user.schema");

/**
 * Search user by id in the database
 * @param id user id
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */

exports.searchById = function(id,done) {
    User.findById(id)
        .then((res) => done(res))
        .catch((err) => {
            return done({status: 404, err: err})
        });
}