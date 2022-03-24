import mongoose, { Schema } from 'mongoose';

interface Comment {
  postID: string;
  authorID: string;
  authorUserName: string;
  bodyText: string;
  edited: boolean;
  upVotes: number;
  downVotes: number;
  attachments?: string[];
}

const commentSchema = new Schema<Comment>(
  {
    // The Forum post ID the comment is made to - must be a document ID length
    postID: {
      type: String,
      required: true,
      trim: true,
      minlength: 24,
      maxLength: 24,
    },
    // The User's ID who authored the comment to the forum post - must be a document ID length
    authorID: {
      type: String,
      required: true,
      trim: true,
      minlength: 24,
      maxLength: 24,
    },
    // User's publicly displayed username
    authorUserName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    // Contains the body of text for the forum post comment
    bodyText: {
      type: String,
      required: true,
      minlength: 1,
    },
    // Used to determine whether a comment has been edited
    edited: {
      type: Boolean,
      required: true,
    },
    // Indicates the number of up votes the forum post comment has
    upVotes: {
      type: Number,
      required: true,
    },
    // Indicates the number of down votes the forum post comment has
    downVotes: {
      type: Number,
      required: true,
    },
    // Contains list of file paths to attachments (optional)
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    // Assigns createdAt and updatedAt fields
    timestamps: true,
  },
);

// User can be used to create new documents with the userSchema
const CommentModel = mongoose.model<Comment>('Comment', commentSchema);
export default CommentModel;
