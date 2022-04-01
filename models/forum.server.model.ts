import { Overwrite } from 'convict';
import { DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import { CommunityDocument } from '../config/db_schemas/community.schema';
import Post, { PostDocument, IPost } from '../config/db_schemas/post.schema';
import Comment, {
  CommentDocument,
  IComment,
} from '../config/db_schemas/comment.schema';
import { UserDocument } from '../config/db_schemas/user.schema';
import { getProp, ServerError } from '../lib/utils.lib';

interface InsertPostDTO {
  owner: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  title: string;
  bodyText?: string;
  edited?: boolean;
  upVotes?: number;
  downVotes?: number;
  attachments?: string[];
  comments?: string[];
}

interface InsertCommentDTO {
  owner: mongoose.Types.ObjectId;
  bodyText: string;
  edited?: boolean;
  upVotes?: number;
  downVotes?: number;
  attachments?: string[];
}

type PopulatedComment = Overwrite<CommentDocument, { owner: UserDocument }>;
type PopulatedPost = PostDocument & {
  owner: UserDocument;
  community: CommunityDocument;
};

/**
 * Insert a new forum post to the database
 * @param params object containing forum post attributes
 */
export async function insertPost(params: InsertPostDTO): Promise<PostDocument> {
  // Create new forum post document
  const newPost = new Post({
    owner: params.owner,
    community: params.community,
    title: params.title,
    bodyText: params.bodyText,
    edited: params.edited ?? false,
    upVotes: params.upVotes ?? 0,
    downVotes: params.downVotes ?? 0,
    attachments: params.attachments ?? [],
    comments: params.comments ?? [],
  });

  // Save new forum post document to database collection
  try {
    return await newPost.save();
  } catch (err) {
    // Forum post is already in the database with unique attributes, return duplicate conflict error
    if (getProp(err, 'code') === 11000) {
      throw new ServerError('Conflict', 409, err);
    }
    // Any other error
    throw err;
  }
}

export async function populatePost(post: PostDocument): Promise<PopulatedPost> {
  return post.populate<{
    owner: UserDocument;
    community: CommunityDocument;
  }>(['community', 'owner']);
}

export async function populatePosts(
  posts: PostDocument[],
): Promise<PopulatedPost[]> {
  return (await Post.populate(posts, [
    { path: 'community' },
    { path: 'owner' },
  ])) as PopulatedPost[];
}

/**
 * Search for a forum post in the database
 * @param id forum post ID
 */
export async function searchPostById(
  id: mongoose.Types.ObjectId,
): Promise<PostDocument> {
  const resource = await Post.findById(id);

  if (resource == null) throw new ServerError('post not found', 404);

  return resource;
}

/**
 * Delete an existing forum post matching a given ID
 * @param id the ID for matching to the database document being deleted
 */
export async function deletePostById(
  id: mongoose.Types.ObjectId,
): Promise<DeleteResult> {
  const result = await Post.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw new ServerError('not found', 404, result);
  }

  return result;
}

/**
 * Updates given fields of a database collection document matching a given ID
 * @param id the ID of the document being updated
 * @param updates the document field(s) being updated
 * @param checkForEdits if set to true, will automatically update the edited field in certain cases
 * @param deltaVotes if set to true, upVote and downVote counts will be added to the existing count instead of replacing.
 */
export async function updatePostById(
  id: mongoose.Types.ObjectId,
  updates: Partial<IPost>,
  checkForEdits: boolean,
  deltaVotes = false,
): Promise<PostDocument> {
  if (checkForEdits && updates.edited === undefined) {
    const editTriggerProperties = ['title', 'bodyText', 'attachments'];
    const updatedProperties = Object.keys(updates);

    const intersection = editTriggerProperties.filter((i) =>
      updatedProperties.includes(i),
    );

    if (intersection.length > 0) updates.edited = true;
  }

  if (deltaVotes) {
    const post = await searchPostById(id);
    if ('upVotes' in updates) {
      updates.upVotes = post.upVotes + updates.upVotes;
    }
    if ('downVotes' in updates) {
      updates.downVotes = post.downVotes + updates.downVotes;
    }
  }

  const resource = await Post.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true },
  );

  if (resource == null) throw new ServerError('post not found', 404);

  return resource;
}

/**
 * Creates and returns a new forum comment using the comment schema
 * @param postId post that the comment is on
 * @param params object containing forum post comment fields
 */
export async function addComment(
  postId: mongoose.Types.ObjectId,
  params: InsertCommentDTO,
): Promise<CommentDocument> {
  const newComment = new Comment(params);

  let comment: CommentDocument;
  try {
    comment = await newComment.save();
  } catch (err: unknown) {
    if (getProp(err, 'code') === 11000) {
      throw new ServerError('Conflict', 409, err);
    }
    throw err;
  }

  await Post.findByIdAndUpdate(postId, {
    $push: {
      comments: {
        $each: [comment._id],
      },
    },
  });

  return comment;
}

/**
 * Search for a forum post in the database
 */
export async function getPosts(): Promise<PostDocument[]> {
  return await Post.find();
}

/**
 * Updates given fields of a database collection document matching a given ID
 * @param id the ID of the document being updated
 * @param updates the document field(s) being updated
 * @param checkForEdits if set to true, will automatically update the edited field in certain cases
 * @param deltaVotes if set to true, upVote and downVote counts will be added to the existing count instead of replacing.
 */
export async function updateCommentById(
  id: mongoose.Types.ObjectId,
  updates: Partial<IComment>,
  checkForEdits: boolean,
  deltaVotes = false,
): Promise<CommentDocument> {
  if (
    checkForEdits &&
    updates.edited == undefined &&
    updates.bodyText != undefined
  ) {
    updates.edited = true;
  }

  if (deltaVotes) {
    const comment = await searchCommentById(id);
    if ('upVotes' in updates)
      updates.upVotes = comment.upVotes + updates.upVotes;
    if ('downVotes' in updates)
      updates.downVotes = comment.downVotes + updates.downVotes;
  }

  return await Comment.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true },
  );
}

export async function searchCommentById(
  id: mongoose.Types.ObjectId,
): Promise<CommentDocument> {
  const resource = await Comment.findById(id);

  if (resource == null) throw new ServerError('comment not found', 404);

  return resource;
}

export async function getAllCommentsByPostId(
  id: mongoose.Types.ObjectId,
): Promise<PopulatedComment[]> {
  const post: any = await Post.findById(id)
    .populate<{ comments: PopulatedComment[] }>({
      path: 'comments',
      populate: { path: 'owner' },
    })
    .exec();

  if (post == null) throw new ServerError('post not found', 404);

  return post.comments;
}
