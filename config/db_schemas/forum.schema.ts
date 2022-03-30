import mongoose, { HydratedDocument, Schema } from 'mongoose';

export interface IForum {
  userID: string;
  communityID: string;
  title: string;
  bodyText: string;
  edited: boolean;
  upVotes: number;
  downVotes: number;
  attachments: string[];
  comments: string[];
}

const forumSchema = new Schema<IForum>(
  {
    // The User's ID who owns the forum post - must be a document ID length
    userID: {
      type: String,
      required: true,
      trim: true,
      minlength: 24,
      maxLength: 24,
    },
    // The ID for the community the blog is associates with
    communityID: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    // Title of the forum post
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    // Contains the body of text for the forum post
    bodyText: {
      type: String,
      required: true,
    },
    // Used to determine whether a post has been edited
    edited: {
      type: Boolean,
      required: true,
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
    attachments: [
      {
        type: String,
      },
    ],
    // Contains the document IDs of post comments (optional)
    comments: [
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

export type ForumDocument = HydratedDocument<IForum>;

// Forum can be used to create new documents with the forumSchema
const ForumModel = mongoose.model<IForum>('Forum', forumSchema);
export default ForumModel;
