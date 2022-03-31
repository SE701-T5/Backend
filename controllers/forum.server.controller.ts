import { Request, Response } from 'express';
import Joi, { array, string } from 'joi';
import { IPost } from '../config/db_schemas/post.schema';
import { UserDocument } from '../config/db_schemas/user.schema';
import { ServerError, TypedRequestBody } from '../lib/utils.lib';
import { searchCommentById } from '../models/forum.server.model';
import * as Forum from '../models/forum.server.model';
import { searchUserByAuthToken } from '../models/user.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import mongoose from 'mongoose';
import { validate, validators } from '../lib/validate.lib';

interface CreatePostDTO {
  title: string;
  community: string;
  bodyText?: string;
  attachments?: string[];
}

interface UpdatePostDTO {
  title?: string;
  bodyText?: string;
  upVotes?: number;
  downVotes?: number;
  attachments?: string[];
}

interface CreateCommentDTO {
  postID: string;
  bodyText: string;
  attachments: string[];
}

interface UpdateCommentDTO {
  upVotes: number;
  downVotes: number;
  bodyText: string;
  attachments: string[];
}

interface CommentResponse {
  owner: {
    id: mongoose.Types.ObjectId;
    username: string;
  };
  bodyText: string;
  edited: boolean;
  upVotes: number;
  downVotes: number;
  attachments: string[];
}

/**
 * Responds to HTTP request with formatted post documents matching a given forum search
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function postViews(req: Request, res: Response<IPost[]>) {
  const posts = await Forum.getPosts();

  const response = posts.map(
    (post) =>
      ({
        owner: post.owner,
        community: post.community,
        title: post.title,
        bodyText: post.bodyText,
        edited: post.edited,
        upVotes: post.upVotes,
        attachments: post.attachments,
        downVotes: post.downVotes,
        comments: post.comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      } as IPost),
  );

  res.status(200).send(response);
}

/**
 * Creates a new forum post using HTTP request object data and parameters for verification
 * @param req HTTP request object containing forum post field data, user ID, and authorization token for verification
 * @param res HTTP request response status code, and message if error, or JSON with post data if successful
 */
export async function postCreate(
  req: TypedRequestBody<CreatePostDTO>,
  res: Response<IPost>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<CreatePostDTO>({
    title: string().min(3).required(),
    community: validators.objectId().required(),
    bodyText: string().allow(['']),
    attachments: array().items(string().uri()).max(3),
  });

  const data = validate(schema, req.body);

  const user = await searchUserByAuthToken(authToken);

  const post = await Forum.insertPost({
    ...data,
    owner: user._id,
    community: new mongoose.Types.ObjectId(data.community),
  });

  res.status(201).send({
    owner: post.owner,
    community: post.community,
    title: post.title,
    bodyText: post.bodyText,
    edited: post.edited,
    upVotes: post.upVotes,
    attachments: post.attachments,
    downVotes: post.downVotes,
    comments: post.comments,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });
}

/**
 * Responds to HTTP request with a formatted post document matching a given ID
 * @param req HTTP request object containing forum post ID for identifying the post being viewed
 * @param res HTTP request response status code and forum post data in JSON format or error message
 */
export async function postViewById(req: Request, res: Response<IPost>) {
  const postID = new mongoose.Types.ObjectId(req.params.id);

  const post = await Forum.searchPostById(postID);
  res.status(200).send({
    owner: post.owner,
    community: post.community,
    title: post.title,
    bodyText: post.bodyText,
    edited: post.edited,
    upVotes: post.upVotes,
    attachments: post.attachments,
    downVotes: post.downVotes,
    comments: post.comments,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });
}

/**
 * Modifies the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post fields being updated, user ID and auth token for verification
 * @param res HTTP request response status code and updated forum post data in JSON format or error message
 */
export async function postUpdateById(
  req: TypedRequestBody<UpdatePostDTO>,
  res: Response<IPost>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<UpdatePostDTO>({
    title: string().min(3),
    attachments: array().items(string().uri()).max(3),
    bodyText: string().allow(['']),
    upVotes: validators.voteDelta(),
    downVotes: validators.voteDelta(),
  })
    .min(1)
    .xor('upVotes', 'downVotes');

  const data = validate(schema, req.body);

  const id = new mongoose.Types.ObjectId(req.params.id);
  const post = await Forum.searchPostById(id);

  if (!(await User.isUserAuthorized(post.owner, authToken))) {
    throw new ServerError('forbidden', 403);
  }

  const newPost = await Forum.updatePostById(id, data, true, true);

  res.status(200).send({
    owner: newPost.owner,
    community: newPost.community,
    title: newPost.title,
    bodyText: newPost.bodyText,
    edited: newPost.edited,
    upVotes: newPost.upVotes,
    attachments: newPost.attachments,
    downVotes: newPost.downVotes,
    comments: newPost.comments,
    createdAt: newPost.createdAt,
    updatedAt: newPost.updatedAt,
  });
}

/**
 * Responds to HTTP request with formatted comment document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function commentViewById(
  req: Request,
  res: Response<CommentResponse[]>,
) {
  const postID = new mongoose.Types.ObjectId(req.params.id);
  const comments = await Forum.getAllCommentsByPostId(postID);
  res.status(200).send(
    comments.map((comment) => ({
      owner: {
        id: comment.owner._id,
        username: comment.owner.username,
      },
      attachments: comment.attachments,
      downVotes: comment.downVotes,
      upVotes: comment.upVotes,
      bodyText: comment.bodyText,
      edited: comment.edited,
    })),
  );
}

/**
 * Creates a new comment for a forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post comment field data, and post ID, and authorization token
 * @param res HTTP request response status code, and message if error, or JSON with comment data if successful
 */
export async function commentGiveById(
  req: TypedRequestBody<CreateCommentDTO>,
  res: Response<CommentResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<CreateCommentDTO>({
    postID: validators.objectId().required(),
    bodyText: Joi.string().required(),
    attachments: Joi.array().items(Joi.string().uri()).max(3),
  });

  const data = validate(schema, req.body);
  const postId = new mongoose.Types.ObjectId(data.postID);

  const user = await searchUserByAuthToken(authToken);
  const comment = await Forum.addComment(postId, {
    ...data,
    owner: user._id,
  });

  res.status(201).send({
    owner: {
      id: user._id,
      username: user.username,
    },
    bodyText: comment.bodyText,
    edited: comment.edited,
    upVotes: comment.upVotes,
    downVotes: comment.downVotes,
    attachments: comment.attachments,
  });
}

/**
 * Modifies the data of an existing forum post comment matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function commentUpdateById(
  req: Request,
  res: Response<CommentResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<UpdateCommentDTO>({
    bodyText: Joi.string(),
    upVotes: validators.voteDelta(),
    downVotes: validators.voteDelta(),
    attachments: Joi.array().items(Joi.string().uri()).max(3),
  })
    .min(1)
    .xor('upVotes', 'downVotes');

  const data = validate(schema, req.body);

  const commentID = new mongoose.Types.ObjectId(req.params.id);
  const comment = await searchCommentById(commentID);

  if (
    !(await User.isUserAuthorized(
      new mongoose.Types.ObjectId(comment.owner),
      authToken,
    ))
  ) {
    throw new ServerError('forbidden', 403);
  }

  const newComment = await Forum.updateCommentById(commentID, data, true, true);
  const populatedComment = await newComment.populate<{ owner: UserDocument }>(
    'owner',
  );
  res.status(200).send({
    owner: {
      id: populatedComment.owner._id,
      username: populatedComment.owner.username,
    },
    edited: newComment.edited,
    upVotes: newComment.upVotes,
    downVotes: newComment.downVotes,
    attachments: newComment.attachments,
    bodyText: newComment.bodyText,
  });
}

/**
 * Delete the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post ID, user ID, and authorization token for verification
 * @param res HTTP request response status code with message whether with error or success
 */
export async function postDeleteById(req: Request, res: Response) {
  const authToken = req.get(config.get('authToken'));
  const id = new mongoose.Types.ObjectId(req.params.id);

  const forum = await Forum.searchPostById(id);

  if (await User.isUserAuthorized(forum.owner, authToken)) {
    await Forum.deletePostById(id);
    res.status(204).send();
  } else {
    throw new ServerError('forbidden', 403);
  }
}
