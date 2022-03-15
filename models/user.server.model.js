const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
{   
    // Username used for login
    username: {
        type: String,
        required: true,
        unique: true,
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
    // Email associated to the account
    email: {
        type: String,
        required: true,
        trim: true
    },
    // Hashed password used for login and verification
    hashedPassword: {
        type: String,
        required: true
    }
});

// User can be used to create new documents with the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;