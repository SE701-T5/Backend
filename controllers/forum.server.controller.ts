import { Request, Response } from 'express';
import { IForum } from '../config/db_schemas/forum.schema';
import { ServerError, TypedRequestBody } from '../lib/utils.lib';
import * as Forum from '../models/forum.server.model';
import { searchUserByAuthToken } from '../models/user.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import {
  isValidDocumentID,
  parseInteger,
  isAnyFieldValid,
  isAllFieldsValid,
  IValidation,
  isFieldsValid,
  getValidValues,
} from '../lib/validate.lib';

interface CreatePostDTO {
  title: string;
  communityID: string;
  bodyText: string;
  attachments: string[];
}

/**
 * Responds to HTTP request with formatted post documents matching a given forum search
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export function postViews(req: Request, res: Response) {
  Forum.getPosts(function (result) {
    if (result.err) {
      // Return the error message with the error status
      res.status(result.status).send(result.err);
    } else {
      // Return the forum post document object with 200 status
      res.json({ forumPost: result });
    }
  });
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
export function postViewById(req: Request, res: Response) {
  const postID = req.params.id ? req.params.id : false;

  if (isValidDocumentID(postID)) {
    Forum.searchPostById(req.params.id, function (result) {
      if (result.err) {
        // Return the error message with the error status
        res.status(result.status).send(result.err);
      } else {
        // Return the forum post document object with 200 status
        res.json({ forumPost: result });
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}

/**
 * Modifies the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post fields being updated, user ID and auth token for verification
 * @param res HTTP request response status code and updated forum post data in JSON format or error message
 */
export function postUpdateById(req: Request, res: Response) {
  const postID = req.params.id ? req.params.id : false,
    userID = req.body.userID ? req.body.userID : false,
    authToken = req.get(config.get('authToken')),
    reqBody = req.body;
  let forumUpdateParams;

  // Set fields for updating to an object with either passed values or false to declare them as invalid
  forumUpdateParams = {
    communityID:
      reqBody.communityID && reqBody.communityID.length > 2
        ? reqBody.communityID
        : false,
    title: reqBody.title && reqBody.title.length > 0 ? reqBody.title : false,
    bodyText: reqBody.text || false,
    upVotes: reqBody.upVotes ? parseInteger(reqBody.upVotes, 0) : false,
    downVotes: reqBody.downVotes ? parseInteger(reqBody.downVotes, 0) : false,
    attachments: reqBody.images || false,
  };

  if (
    isValidDocumentID(postID) &&
    isValidDocumentID(userID) &&
    isAnyFieldValid(forumUpdateParams)
  ) {
    User.isUserAuthorized(userID, authToken, function (result) {
      if (result.isAuth) {
        Forum.updatePostById(postID, forumUpdateParams, function (result) {
          if (result.err) {
            // Return the error message with the error status
            res.status(result.status).send(result.err);
          } else {
            // Return the forum post document object with 201 status
            res.status(201).json({ forumPost: result });
          }
        });
      } else {
        if (result.err) {
          // Return the error message with the error status
          res.status(result.status).send(result.err);
        } else {
          res.status(401).send('Unauthorized');
        }
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}

/**
 * Responds to HTTP request with formatted comment document matching a given ID
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export function commentViewById(req: Request, res: Response) {
  const postID = req.params.id ? req.params.id : false;

  if (isValidDocumentID(postID)) {
    Forum.searchPostById(req.params.id, function (result) {
      if (result.err) {
        // Return the error message with the error status
        res.status(result.status).send(result.err);
      } else {
        // Return the forum post document object with 200 status
        res.json({ forumPostComments: result.comments });
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}

/**
 * Creates a new comment for a forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post comment field data, and post ID, and authorization token
 * @param res HTTP request response status code, and message if error, or JSON with comment data if successful
 */
export function commentGiveById(req: Request, res: Response) {
  const reqParams = req.params,
    reqBody = req.body,
    authToken = req.get(config.get('authToken')),
    commentParams = {
      postID: isValidDocumentID(reqParams.id) ? reqParams.id : false,
      authorID: isValidDocumentID(reqBody.authorID) ? reqBody.authorID : false,
      authorUserName:
        reqBody.username && reqBody.username.length > 2
          ? reqBody.username
          : false,
      bodyText:
        reqBody.bodyText && reqBody.bodyText.length > 0
          ? reqBody.bodyText
          : false,
      attachments: reqBody.images ? reqBody.images : [''],
    };

  if (isAllFieldsValid(commentParams)) {
    User.isUserAuthorized(commentParams.authorID, authToken, function (result) {
      if (result.isAuth) {
        Forum.addComment(commentParams, function (result) {
          if (result.err) {
            // Return the error message with the error status
            res.status(result.status).send(result.err);
          } else {
            // Comment was created successfully, return 201 status
            res.status(201).json({ comment: result });
          }
        });
      } else {
        if (result.err) {
          // Return the error message with the error status
          res.status(result.status).send(result.err);
        } else {
          res.status(401).send('Unauthorized');
        }
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}

/**
 * Modifies the data of an existing forum post comment matching a given ID using HTTP request object data
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export function commentUpdateById(req: Request, res: Response) {
  const commentID = req.params.id ? req.params.id : false,
    userID = req.body.userID ? req.body.userID : false,
    authToken = req.get(config.get('authToken')),
    reqBody = req.body;
  let commentUpdateParams;
  // Set fields for updating to an object with either passed values or false to declare them as invalid
  commentUpdateParams = {
    bodyText: reqBody.text || false,
    upVotes: reqBody.upVotes ? parseInteger(reqBody.upVotes, 0) : false,
    downVotes: reqBody.downVotes ? parseInteger(reqBody.downVotes, 0) : false,
  };

  if (isValidDocumentID(userID) && isAnyFieldValid(commentUpdateParams)) {
    User.isUserAuthorized(userID, authToken, function (result) {
      if (result.isAuth) {
        Forum.updateCommentById(
          commentID,
          commentUpdateParams,
          function (result) {
            if (result.err) {
              // Return the error message with the error status
              res.status(result.status).send(result.err);
            } else {
              // Return the comment post document object with 201 status
              res.status(201).json({ commentPost: result });
            }
          },
        );
      } else {
        if (result.err) {
          // Return the error message with the error status
          res.status(result.status).send(result.err);
        } else {
          res.status(401).send('Unauthorized');
        }
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}

/**
 * Delete the data of an existing forum post matching a given ID using HTTP request object data
 * @param req HTTP request object containing forum post ID, user ID, and authorization token for verification
 * @param res HTTP request response status code with message whether with error or success
 */
export function postDeleteById(req: Request, res: Response) {
  const postID = req.params.id ? req.params.id : false,
    userID = req.body.userID ? req.body.userID : false,
    authToken = req.get(config.get('authToken'));

  if (isValidDocumentID(postID) && isValidDocumentID(userID)) {
    User.isUserAuthorized(userID, authToken, function (result) {
      if (result.isAuth) {
        Forum.deletePostById(postID, function (result) {
          if (result.err) {
            // Return the error message with the error status
            res.status(result.status).send(result.err);
          } else {
            // Return a message body { success: true } with 200 status
            res.status(200).json({ success: true });
          }
        });
      } else {
        if (result.err) {
          // Return the error message with the error status
          res.status(result.status).send(result.err);
        } else {
          res.status(401).send('Unauthorized');
        }
      }
    });
  } else {
    res.status(400).send('Bad request');
  }
}
