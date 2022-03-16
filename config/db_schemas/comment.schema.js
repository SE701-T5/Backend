const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
{   
    // Username used of the user who made the comment
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    // This is the user's public display name
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    // Date when the comment was created
    date: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    // Content of the comment
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    
}, {
    // Assigns createdAt and updatedAt fields
    timestamps: true
});

// User can be used to create new documents with the userSchema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;