const User = require('../config/db_schemas/comment.schema')

/**
 * Creates and returns a new forum comment using the commentSchema
 * @param {String} username User's username that made the comment
 * @param {String} name User's name used for public display
 * @param {String} date Date when the comment was created
 * @param {String} content Content of the comment
 */
exports.create = function (username, name, date, content) {
    const newComment = new Comment({
        username,
        name,
        date,
        content
    });
    newComment.save()
        .then((res) => done(res))
        .catch((err) => {
            if (err.code === 11000) {
                return done({ err: "Conflict", status: 409 });
            }
            return done({ status: 500, err: err })
        });
}