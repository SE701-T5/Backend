const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const forumSchema = new Schema(
{
    // The User's ID who owns the forum post
    userID: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    // Title of the forum post
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    // Contains the body of text for the forum post
    bodyText: {
        type: String,
        required: true
    },
    // Used to deterine whether a post has been editted
    editted: {
        type: Boolean,
        required: true
    },
    // Indicates the number of up votes the forum post has
    upVotes: {
        type: Number,
        required: true,
    },
    // Indicates the number of down votes the forum post has
    downVotes: {
        type: Number,
        required: true,
    },
    // Contains list of file paths to attachments (optional)
    attachments: [{
        type: String
    }],
    comments: [
        //TODO: Change to use 'commentSchema' once it has been created
    ]
});

// Forum can be used to create new documents with the forumSchema
const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;