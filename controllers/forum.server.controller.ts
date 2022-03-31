import { Request, Response } from 'express';
import { IForum } from '../config/db_schemas/forum.schema';
import { ServerError, TypedRequestBody } from '../lib/utils.lib';
import * as Forum from '../models/forum.server.model';
import { searchUserByAuthToken } from '../models/user.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import mongoose from 'mongoose';
import {
  isValidDocumentID,
  parseInteger,
  // isAnyFieldValid,
  // isAllFieldsValid,
  IValidation,
  isFieldsValid,
  getValidValues,
} from '../lib/validate.lib';
import { IComment } from '../config/db_schemas/comment.schema';

interface CreatePostDTO {
  title: string;
  communityID: string;
  bodyText: string;
  attachments: string[];
}

interface UpdatePostDTO {
  title: string;
  communityID: string;
  bodyText: string;
  upVotes: number;
  downVotes: number;
  attachments: string[];
}

interface CreateCommentDTO {
  postID: string;
  authorID: string;
  authorUserName: string;
  bodyText: string;
  attachments: string[];
}

interface UpdateCommentDTO {
  postID: string;
  authorID: string;
  authorUserName: string;
  upVotes: number;
  downVotes: number;
  attachments: string[];
}

/**
 * Responds to HTTP request with formatted post documents matching a given forum search
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function postViews(req: Request, res: Response<Array<IForum>>) {
  try {
    const posts = await Forum.getPosts();
    const response = Array<IForum>();
    for (const post of posts){
      response.push({
        userID: post.userID,
        communityID: post.communityID,
        title: post.title,
        bodyText: post.bodyText,
        edited: post.edited,
        upVotes: post.upVotes,
        attachments: post.attachments,
        downVotes: post.downVotes,
        comments: post.comments,
      })
    }
    res.status(200).send(response);
  }catch (err){
    throw new ServerError('bad request', 400);
  };
}

/**
 * Creates a new forum post using HTTP request object data and parameters for verification
 * @param req HTTP request object containing forum post field data, user ID, and authorization token for verification
 * @param res HTTP request response status code, and message if error, or JSON with post data if successful
 */
export async function postCreate(
  req: TypedRequestBody<CreatePostDTO>,
  res: Response<IForum>,
) {
  const authToken = req.get(config.get('authToken'));

  // Set forum post fields to an object for passing to the model
  const forumPostParams: IValidation<CreatePostDTO> = {
    title: {
      value: req.body.title,
      valid: req.body.title.length > 0,
    },
    communityID: {
      value: req.body.communityID,
      valid: isValidDocumentID,
    },
    bodyText: {
      value: req.body.bodyText,
      valid: req.body.bodyText != undefined,
    },
    attachments: {
      value: req.body.attachments,
      valid: req.body.attachments != undefined,
    },
  };

  if (isFieldsValid(forumPostParams)) {
    const params = getValidValues(forumPostParams);

    const user = await searchUserByAuthToken(authToken);

    const post = await Forum.insertPost({
      userID: user._id.toString(),
      ...params,
    });

    res.status(201).send({
      userID: post.userID,
      communityID: post.communityID,
      title: post.title,
      bodyText: post.bodyText,
      edited: post.edited,
      upVotes: post.upVotes,
      attachments: post.attachments,
      downVotes: post.downVotes,
      comments: post.comments,
    });
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Responds to HTTP request with a formatted post document matching a given ID
 * @param req HTTP request object containing forum post ID for identifying the post being viewed
 * @param res HTTP request response status code and forum post data in JSON format or error message
 */
export async function postViewById(req: Request, res: Response<IForum>) {
  const postID = req.params.id;
  
  if (isValidDocumentID(postID)){
    const post = await Forum.searchPostById(new mongoose.Types.ObjectId(postID));
    res.status(200).send({
      userID: post.userID,
      communityID: post.communityID,
      title: post.title,
      bodyText: post.bodyText,
      edited: post.edited,
      upVotes: post.upVotes,
      attachments: post.attachments,
      downVotes: post.downVotes,
      comments: post.comments,
    });
  }else{
    throw new ServerError('bad request', 400, { postID });
  }
}

/**
 * Modifies the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post fields being updated, user ID and auth token for verification
 * @param res HTTP request response status code and updated forum post data in JSON format or error message
 */
export async function postUpdateById(req: TypedRequestBody<UpdatePostDTO>, res: Response<IForum>) {
  const authToken = req.get(config.get('authToken'));
  const postID = req.params.id;
  const forumUpdateParams: IValidation<UpdatePostDTO> = {
    title: {
      value: req.body.title,
      valid: req.body.title.length > 0,
    },
    communityID: {
      value: req.body.communityID,
      valid: isValidDocumentID,
    },
    bodyText: {
      value: req.body.bodyText,
      valid: req.body.bodyText != undefined,
    },
    attachments: {
      value: req.body.attachments,
      valid: req.body.attachments != undefined,
    },
    upVotes: {
      value: req.body.upVotes,
      valid: req.body.upVotes != undefined,
    },
    downVotes: {
      value: req.body.downVotes,
      valid: req.body.downVotes != undefined,
    }
  }

  if (isFieldsValid(forumUpdateParams) && isValidDocumentID(postID)){
    const params = getValidValues(forumUpdateParams);
    const id = new mongoose.Types.ObjectId(postID);
    const user = await searchUserByAuthToken(authToken);
    const post = await Forum.updatePostById(id, {
      userID: user._id.toString(),
      ...params,
    }, true, true);
    res.status(200).send({
      userID: post.userID,
      communityID: post.communityID,
      title: post.title,
      bodyText: post.bodyText,
      edited: post.edited,
      upVotes: post.upVotes,
      attachments: post.attachments,
      downVotes: post.downVotes,
      comments: post.comments,
    });
  }else{
    throw new ServerError('bad request', 400, { postID });
  }
}

/**
 * Responds to HTTP request with formatted comment document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function commentViewById(req: Request, res: Response<Array<IComment>>) {
  const postID = req.params.id;
  if (isValidDocumentID(postID)) {
    const comments = await Forum.getAllCommentsByPostId(new mongoose.Types.ObjectId(postID));
    res.status(200).send(comments);
  }else{
    throw new ServerError('bad request', 400);
  }
}

/**
 * Creates a new comment for a forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post comment field data, and post ID, and authorization token
 * @param res HTTP request response status code, and message if error, or JSON with comment data if successful
 */
export async function commentGiveById(req: TypedRequestBody<CreateCommentDTO>, res: Response<IComment>) {
  const authToken = req.get(config.get('authToken'));

  const commentParams: IValidation<CreateCommentDTO> = {
    postID: {
      value: req.params.id,
      valid: isValidDocumentID,
    },
    authorID: {
      value: req.body.authorID,
      valid: isValidDocumentID,
    },
    authorUserName: {
      value: req.body.authorUserName,
      valid: req.body.authorUserName != undefined,
    },
    bodyText: {
      value: req.body.bodyText,
      valid: req.body.bodyText != undefined,
    },
    attachments: {
      value: req.body.attachments,
      valid: req.body.attachments != undefined,
    },
  };

  if (isFieldsValid(commentParams)) {
    const params = getValidValues(commentParams);

    const user = await searchUserByAuthToken(authToken);

    const comment = await Forum.addComment({
      ...params,
    });

    res.status(201).send({
      postID: comment.postID,
      authorID: comment.authorID,
      authorUserName: comment.authorUserName,
      bodyText: comment.bodyText,
      edited: comment.edited,
      upVotes: comment.upVotes,
      downVotes: comment.downVotes,
      attachments: comment.attachments,
    });
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Modifies the data of an existing forum post comment matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function commentUpdateById(req: Request, res: Response<IComment>) {
  const authToken = req.get(config.get('authToken'));
  const commentID = req.params.id;

  const commentUpdateParams: IValidation<UpdateCommentDTO> = {
    postID: {
      value: req.body.postID,
      valid: isValidDocumentID,
    },
    authorID: {
      value: req.body.authorID,
      valid: isValidDocumentID,
    },
    authorUserName: {
      value: req.body.authorUserName,
      valid: req.body.authorUserName != undefined,
    },
    upVotes: {
      value: req.body.upVotes,
      valid: req.body.upVotes != undefined,
    },
    downVotes: {
      value: req.body.downVotes,
      valid: req.body.downVotes != undefined,
    },
    attachments: {
      value: req.body.attachments,
      valid: req.body.attachments != undefined,
    }
  }

  if (isValidDocumentID(commentID) && isFieldsValid(commentUpdateParams)) {

    const params = getValidValues(commentUpdateParams);

    const user = await searchUserByAuthToken(authToken);

    const comment = await Forum.updateCommentById(new mongoose.Types.ObjectId(commentID),
      params, true, true);
    res.status(200).send(comment);
  } else {
    throw new ServerError('bad request', 400);
  }
}

/**
 * Delete the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post ID, user ID, and authorization token for verification
 * @param res HTTP request response status code with message whether with error or success
 */
export async function postDeleteById(req: Request, res: Response) {
  const authToken = req.get(config.get('authToken'));

  if (isValidDocumentID(req.params.id)) {
    const id = new mongoose.Types.ObjectId(req.params.id);

    if (await User.searchUserByAuthToken(authToken)) {
      await Forum.deletePostById(id);
      res.status(204).send();
    } else {
      throw new ServerError('forbidden', 403);
    }
  } else {
    throw new ServerError('bad request', 400);
  }
}
