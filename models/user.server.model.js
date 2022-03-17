const User = require('../config/db_schemas/user.schema')

/**
 * Creates and returns a new forum user using the userSchema
 * @param {String} username User's username used for login
 * @param {String} name User's name used for public display
 * @param {String} email User's email associated to their account
 * @param {String} hashedPassword User's hashed password used for login and verification
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
 exports.create = function(username, name, email, hashedPassword, done) {
    const newUser = new User({
        username,
        name,
        email,
        hashedPassword
    });
    newUser.save()
        .then((res) => done(res))
        .catch((err) => {
            if (err.code === 11000) {
                return done({err: "Conflict", status: 409});
            }
            return done({status: 500, err: err})
        });
}

