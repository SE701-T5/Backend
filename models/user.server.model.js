const User = require('../config/db_schemas/user.schema')

/**
 * Creates and returns a new forum user using the userSchema
 * @param {String} username User's username used for login
 * @param {String} name User's name used for public display
 * @param {String} email User's email associated to their account
 * @param {String} hashedPassword User's hashed passsword used for login and verification
 */
function createUser(username, name, email, hashedPassword) {
    const newUser = new User({
        username,
        name,
        email,
        hashedPassword
    })
    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
}

module.exports = { createUser };
