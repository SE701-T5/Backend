const Forum = require("../config/db_schemas/forum.schema");

/**
 * Insert a new forum post to the database
 * @param params object containing forum post attributes
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
exports.insertPost = function(params, done) {
    // Set forum post attributes
    const
        userID = params.userID,
        communityID = params.communityID,
        title = params.title,
        bodyText = params.text,
        edited = false,
        upVotes = 0,
        downVotes = 0,
        attachments = params.images,
        comments = [];

    // Create new forum post document
    const newPost = new Forum({
        userID,
        communityID,
        title,
        bodyText,
        edited,
        upVotes,
        downVotes,
        attachments,
        comments
    });

    // Save new forum post document to database collection
    newPost.save()
        .then((res) => {
            return done(res);
        })
        .catch((err) => {
            // Forum post is already in the database with unique attributes, return duplicate conflict error
            if (err.code === 11000) {
                return done({err: "Conflict", status: 409});
            }
            // Any other database error, return internal server error
            return done({err: "Internal server error", status: 500});
        });
}
/**
 * Search a forum post in the database
 * @param id forum post id
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */

exports.searchById = function(id,done) {
    Forum.findById(id)
        .then((res) => done(res))
        .catch((err) => {
            return done({status: 400, err: err})
        });
}