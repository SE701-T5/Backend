const User = require('../config/db_schemas/user.schema')

/**
 * Creates and returns a new forum user using the userSchema
 * @param params object containing forum user attributes
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
exports.create = function(params, done) {
    const
        username = params.username,
        displayName = params.displayName,
        email = params.email,
        hashedPassword = params.hashedPassword;

    const newUser = new User({
        username,
        displayName,
        email,
        hashedPassword
    });

    newUser.save()
        .then((res) => done(res))
        .catch((err) => {
            // Forum user is already in the database with unique attributes, return duplicate conflict error
            if (err.code === 11000) {
                return done({err: "Conflict", status: 409});
            }
            // Any other database error, return internal server error
            return done({err: "Internal server error", status: 500});
        });
}

/**
 * Search user by id in the database
 * @param id user id
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
exports.searchById = function(id,done) {
    try {
        User.findById(id)
            .then((res) => done(res))
            .catch((err) => {
                return done({status: 404, err: err})
            });
    } catch (err) {
        done({ status: 500, err: err });
    }
}

/**
 * Delete an existing forum user matching a given ID
 * @param id the ID for matching to the database document being deleted
 * @param done function callback, returns status code and message if error
 */
exports.deleteUserById = function(id, done) {
    User.deleteOne({ _id: id })
        .then((res) => {
            if (res.deletedCount === 0) {
                return done({ err: "Not found", status: 404 });
            }
            return done(res);
        })
        .catch((err) => {
            return done({ err: "Internal server error", status: 500 });
        });
}