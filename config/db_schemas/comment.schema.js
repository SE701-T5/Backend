const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
{   
    postID: {
        type: String,
        required: true,
        trim: true,
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
        minlength: 10 // Date is in international format: YYYY-MM-DD
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