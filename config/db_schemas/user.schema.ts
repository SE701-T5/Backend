import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';

export interface IUser {
  username: string;
  displayName: string;
  email: string;
  hashedPassword: string;
  salt: string;
  authToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    // Username used for login
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    // This is the user's public display name
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    // Email associated to the account
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Hashed password used for login and verification
    hashedPassword: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    // Authorization for verifying users are logged in and can access data
    authToken: {
      type: String,
      required: false,
    },
  },
  {
    // Assigns createdAt and updatedAt fields
    timestamps: true,
  },
);

export type UserDocument = HydratedDocument<IUser>;

// User can be used to create new documents with the userSchema
const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;
