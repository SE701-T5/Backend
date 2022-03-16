const User = require('../config/db_schemas/user.schema')

/**
 * Returns the hashPassword given a plaintextPassword
 * @param {String} password
 */
function hashPassword(password) {
    // TODO: Create a has function for the password
    return 'password'
}

/**
 * Creates and returns a new forum user using the userSchema
 * @param {String} username User's username used for login
 * @param {String} name User's name used for public display
 * @param {String} email User's email associated to their account
 * @param {String} password User's passsword used for login and verification
 */
 exports.create = function(username, name, email, password) {
    var hashedPassword = hashPassword(password)
    return newUser = new User({
        username,
        name,
        email,
        hashedPassword
    })
}
