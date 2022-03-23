import mongoose, { Schema } from 'mongoose';

interface User {
    username: string;
    displayName: string;
    email: string;
    hashedPassword: string;
    authToken: string;
}

const userSchema = new Schema<User>(
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
    displayName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    // Email associated to the account
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Hashed password used for login and verification
    hashedPassword: {
        type: String,
        required: true
    },
    // Authorization for verifying users are logged in and can access data
    authToken: {
        type: String,
        required: true
    }
}, {
    // Assigns createdAt and updatedAt fields
    timestamps: true
});

// User can be used to create new documents with the userSchema
const UserModel = mongoose.model<User>('User', userSchema);
export default UserModel;
