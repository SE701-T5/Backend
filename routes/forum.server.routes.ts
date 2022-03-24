import { Express } from "express";
import * as forum from "../controllers/forum.server.controller";
import { isRequestTokenAuthorized } from "../lib/middleware.lib";

/**
 * Handles HTTP requests for the Forum module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
  app
    .route("/api/v1/posts")
    .get(forum.postViews)
    .post(isRequestTokenAuthorized, forum.postCreate);

  app
    .route("/api/v1/posts/:id")
    .get(forum.postViewById)
    .patch(isRequestTokenAuthorized, forum.postUpdateById)
    .delete(isRequestTokenAuthorized, forum.postDeleteById);

  app
    .route("/api/v1/posts/:id/comments")
    .get(forum.commentViewById)
    .post(forum.commentGiveById);

  app.route("/api/v1/posts/:id/comments/:id").patch(forum.commentUpdateById);
}
