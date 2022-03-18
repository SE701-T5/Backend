const User = require('../config/db_schemas/user.schema');

/**
 * Hashes a given plaintext password
 * @param password plaintext password for hashing
 * @returns {String} hashed password
 */
function hashPassword(password) {
    // TODO: Create a function for hashing (and maybe salting) passwords
    return password;
}

/**
 * Creates and returns a new forum user using the userSchema
 * @param params object containing forum user attributes
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
createUser = function(params, done) {
    const
        username = params.username,
        displayName = params.displayName,
        email = params.email,
        hashedPassword = hashPassword(params.hashedPassword);

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
searchUserById = function(id, done) {
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
 * Updates given fields of a database collection document for a user matching a given ID
 * @param id the ID of the document being updated
 * @param updates the document field(s) being updated
 * @param done function callback, returns status code, and updated document data or message if error
 */
updateUserById = function(id, updates, done) {
    if ("hashedPassword" in updates) {
        updates.hashedPassword = hashPassword(updates.hashedPassword);
    }
    // Find the forum user database document matching the given ID, update all edited fields, return updated user data
    User.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true })
        .then((res) => {
            return res ? done(res) : done({ err: "Not found", status: 404 });
        })
        .catch((err) => {
            return done({ err: "Internal server error", status: 500 });
        });
}

module.exports = { updateUserById, searchUserById, createUser };
