const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
{   
    commentID: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    postID: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    authorID: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    authorDisplayName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    bodytext: {
        type: String,
        required: true,
        minlength: 1
    },
    date: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    upVotes: {
        type: Number,
        required: true,
    },
    downVotes: {
        type: Number,
        required: true,
    },
}, {
    // Assigns createdAt and updatedAt fields
    timestamps: true
});

// User can be used to create new documents with the userSchema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;