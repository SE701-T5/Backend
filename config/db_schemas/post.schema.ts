import mongoose, { HydratedDocument, Schema } from 'mongoose';
import { TimestampedModel } from '../../lib/utils.lib';

export interface IPost extends TimestampedModel {
  owner: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  title: string;
  bodyText: string;
  edited: boolean;
  upVotes: number;
  downVotes: number;
  attachments: string[];
  comments: mongoose.Types.ObjectId[];
}

const postSchema = new Schema<IPost>(
  {
    // The User's ID who owns the forum post - must be a document ID length
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The ID for the community the blog is associates with
    community: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Community',
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
      default: '',
    },
    // Used to determine whether a post has been edited
    edited: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Indicates the number of up votes the forum post has
    upVotes: {
      type: Number,
      required: true,
      default: 0,
    },
    // Indicates the number of down votes the forum post has
    downVotes: {
      type: Number,
      required: true,
      default: 0,
    },
    // Contains list of file paths to attachments (optional)
    attachments: [
      {
        type: String,
        default: [],
        required: true,
      },
    ],
    // Contains the document IDs of post comments (optional)
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: true,
        default: [],
      },
    ],
  },
  {
    // Assigns createdAt and updatedAt fields
    timestamps: true,
  },
);

export type PostDocument = HydratedDocument<IPost>;

// Forum can be used to create new documents with the postSchema
const PostModel = mongoose.model<IPost>('Post', postSchema);
export default PostModel;
