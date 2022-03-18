const Comment = require('../config/db_schemas/comment.schema')

/**
 * Creates and returns a new forum comment using the commentSchema
 * @param {String} postID id of the post that the comment was made to
 * @param {String} authorID id of the author who made the comment
 * @param {String} authorDisplayName displayName of the author who made the comment
 * @param {String} bodytext content of the comment
 * @param {String} date date when the comment was made
 * @param {String} upVotes 
 * @param {String} downVotes 
 */
exports.create = function (postID, authorID, authorDisplayName, bodytext, date, upVotes, downVotes) {
    const newComment = new Comment({
        postID,
        authorID,
        authorDisplayName,
        bodytext,
        date,
        upVotes,
        downVotes
    });
    newComment.save()
        .then((res) => done(res))
        .catch((err) => {
            if (err.code === 11000) {
                return done({ err: "Conflict", status: 409 });
            }
            return done({ err: "Internal server error", status: 500 })
        });
}