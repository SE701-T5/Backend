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
        hashedPassword = hashPassword(params.hashedPassword),
        authToken = "0";

    const newUser = new User({
        username,
        displayName,
        email,
        hashedPassword,
        authToken
    });

    newUser.save()
        .then((res) => {
            return done(res);
        })
        .catch((err) => {
            // Forum user is already in the database with unique attributes, return duplicate conflict error
            if (err.code === 11000) {
                return done({ err: "Conflict", status: 409 });
            }
            // Any other database error, return internal server error
            return done({ err: "Internal server error", status: 500 });
        });
}

/**
 * Search for a user document in the user collections of the database with a matching _id field
 * @param id the user ID for matching with a _id field in the database
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
searchUserById = function(id, done) {
    try {
        User.findById(id)
            .then((res) => done(res))
            .catch((err) => {
                return done({ status: 404, err: err })
            });
    } catch (err) {
        done({ status: 500, err: err });
    }
}

/**
 * Search for a user document in the user collections of the database with a matching authToken field
 * @param authToken the authorization token for matching with an authToken field in the database
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
searchUserByAuthToken = function(authToken, done) {
    try {
        User.findOne({ authToken: authToken })
            .then((res) => done({ status: 200, res: res }))
            .catch((err) => {
                return done({ status: 404, err: err })
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
deleteUserById = function(id, done) {
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
    try {
        // Find the forum user database document matching the given ID, update all edited fields, return updated user data
        User.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true })
            .then((res) => {
                return res ? done(res) : done({ err: "Not found", status: 404 });
            })
            .catch((err) => {
                return done({ err: "Not found", status: 404 });
            });
    } catch (err) {
        return done({ err: "Internal server error", status: 500 });
    }
}

/**
 * Authenticates a user by searching for any existing user in the database with a matching provided login and password
 * @param login the given { login-type: login-value } being matched with a login of any existing user in the database
 * @param password the given password being matched with the password of an existing user matched by the given login
 * @param done function callback, returns user data if authenticated, false if not or error message if server error
 */
authenticateUser = function(login, password, done) {
    if ("email" || "username" in login) {
        try {
            User.findOne(login)
                .then((res) => {
                    if (res.hashedPassword.match(hashPassword(password))) {
                        return done(res);
                    }
                    return done(false);
                })
                .catch((err) => {
                    return done(false);
                });
        } catch (err) {
            return done({ status: 500, err: err });
        }
    } else {
        return done(false);
    }
}

/**
 * Gets the authorization token of a user if the user exists in the database and is logged-in
 * @param userID the user ID for matching with a _id field in the database
 * @param done function callback, returns authorization token if one, or false, or status code and message if error
 */
getUserAuthToken = function(userID, done) {
    searchUserById(userID, function (result) {
        if (result.err) {
            // Return the error message with the error status
            return done({ status: result.status, err: result.err });
        } else {
            if (result.authToken.length === 16) {
                // Return a user's authorization token
                return done(result.authToken);
            } else {
                // Return false because an authorization token hasn't yet been set
                return done(false);
            }
        }
    });
}

/**
 * Sets the authorization token of a user if the user exists in the database and has logged in
 * @param userID the user ID for matching with a _id field in the database
 * @param done function callback, returns authorization token if one, or status code and message if error
 */
setUserAuthToken = function(userID, done) {
    // Resourced from: https://stackoverflow.com/questions/58325771/how-to-generate-random-hex-string-in-javascript
    const hexToken = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    updateUserById(userID, { authToken: hexToken }, function (result) {
        if (result.err) {
            // Return the error message with the error status
            return done({ status: result.status, err: result.err });
        } else {
            // Return the authorization token in JSON format
            return done({ authToken: result.authToken });
        }
    });
}

/**
 * Verify if a user exists in the database and is currently authorized to access, store and modify database data
 * @param userID the user ID for matching with a _id field in the database
 * @param authToken the authorization token for matching with an authToken field in the database
 * @param done function callback, returns true if user is authorized, otherwise false, or status code and error message
 */
isUserAuthorized = function(userID, authToken, done) {
    if (authToken && typeof authToken === 'string' && authToken.length === 16) {
        searchUserById(userID, function (result) {
            if (result.err) {
                // Return the error message with the error status
                return done({ isAuth: false, status: result.status, err: result.err });
            } else {
                if (result.authToken.match(authToken)) {
                    return done({ isAuth: true });
                } else {
                    return done({ isAuth: false });
                }
            }
        });
    } else {
        return done({ isAuth: false });
    }
}

/**
 * Resets the authorization token of a user to unauthorized, or "0", if the user exists in the database and is logged in
 * @param userID the user ID for matching with a _id field in the database
 * @param done function callback, returns status code, and message if error
 */
removeUserAuthToken = function(userID, done) {
    updateUserById(userID, { authToken: "0" }, function (result) {
        if (result.err) {
            // Return the error message with the error status
            return done({ status: result.status, err: result.err });
        } else {
            // Return success status
            return done({ status: 200 });
        }
    });
}

module.exports = {
    updateUserById,
    searchUserById,
    createUser,
    deleteUserById,
    authenticateUser,
    getUserAuthToken,
    setUserAuthToken,
    isUserAuthorized,
    searchUserByAuthToken,
    removeUserAuthToken
};
