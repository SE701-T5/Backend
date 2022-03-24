import Forum from '../config/db_schemas/forum.schema';
import Comment from '../config/db_schemas/comment.schema';

/**
 * Insert a new forum post to the database
 * @param params object containing forum post attributes
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
export function insertPost(params, done) {
  // Set forum post attributes
  const userID = params.userID,
    communityID = params.communityID,
    title = params.title,
    bodyText = params.bodyText,
    edited = false,
    upVotes = 0,
    downVotes = 0,
    attachments = params.attachments,
    comments = [''];

  // Create new forum post document
  const newPost = new Forum({
    userID,
    communityID,
    title,
    bodyText,
    edited,
    upVotes,
    downVotes,
    attachments,
    comments,
  });

  // Save new forum post document to database collection
  newPost
    .save()
    .then((res) => {
      return done(res);
    })
    .catch((err) => {
      // Forum post is already in the database with unique attributes, return duplicate conflict error
      if (err.code === 11000) {
        return done({ err: 'Conflict', status: 409 });
      }
      // Any other database error, return internal server error
      return done({ err: 'Internal server error', status: 500 });
    });
}

/**
 * Search for a forum post in the database
 * @param id forum post ID
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
export function searchPostById(id, done) {
  try {
    Forum.findById(id)
      .then((res) => done(res))
      .catch((err) => {
        return done({ status: 404, err: err });
      });
  } catch (err) {
    return done({ err: 'Internal server error', status: 500 });
  }
}

/**
 * Delete an existing forum post matching a given ID
 * @param id the ID for matching to the database document being deleted
 * @param done function callback, returns status code and message if error
 */
export function deletePostById(id, done) {
  Forum.deleteOne({ _id: id })
    .then((res) => {
      if (res.deletedCount === 0) {
        return done({ err: 'Not found', status: 404 });
      }
      return done(res);
    })
    .catch((err) => {
      return done({ err: 'Internal server error', status: 500 });
    });
}

/**
 * Updates given fields of a database collection document matching a given ID
 * @param id the ID of the document being updated
 * @param updates the document field(s) being updated
 * @param done function callback, returns status code and message if error
 */
export function updatePostById(id, updates, done) {
  // Search for a document matching the given ID to increment upVotes and downVotes
  searchPostById(id, function (result) {
    if (result.err) {
      // Return the error message with the error status
      return done(result);
    } else {
      updates['upVotes'] = updates.upVotes
        ? updates.upVotes + result.upVotes
        : result.upVotes;
      updates['downVotes'] = updates.downVotes
        ? updates.downVotes + result.downVotes
        : result.downVotes;
      updates['comments'] = updates.comments
        ? result.comments.concat(updates.comments)
        : result.comments;

      // If the update does not just involve up votes, down votes, or comments, and actual edits
      if (Object.keys(updates).length > 3) {
        updates['edited'] = true; // set the edited field to true
      }

      // Find the document and update the changed fields
      Forum.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true })
        .then((res) => {
          return done(res);
        })
        .catch((err) => {
          return done({ err: 'Internal server error', status: 500 });
        });
    }
  });
}

/**
 * Creates and returns a new forum comment using the comment schema
 * @param params object containing forum post comment fields
 * @param done function callback, returns status code, and message if error, or JSON if successful
 */
export function addComment(params, done) {
  const postID = params.postID,
    authorID = params.authorID,
    authorUserName = params.authorUserName,
    bodyText = params.bodyText,
    edited = false,
    upVotes = 0,
    downVotes = 0,
    attachments = params.attachments;

  const newComment = new Comment({
    postID,
    authorID,
    authorUserName,
    bodyText,
    edited,
    upVotes,
    downVotes,
    attachments,
  });

  newComment
    .save()
    .then((res) => {
      updatePostById(postID, { comments: [res.id] }, function (result) {
        if (result.err) {
          // Return the error message with the error status
          return done(result);
        } else {
          done(res);
        }
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return done({ err: 'Conflict', status: 409 });
      }
      return done({ err: 'Internal server error', status: 500 });
    });
}
