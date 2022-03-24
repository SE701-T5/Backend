import * as Database from "../models/db.server.model";
import { Request, Response } from "express";

/**
 * Responds to HTTP request for removing all documents from database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export function resetDB(req: Request, res: Response) {
  const isAdminUserAuthenticated = true; // TODO: implement admin user authentication

  if (isAdminUserAuthenticated) {
    // Remove all documents in the database collections
    Database.resetCollections().then((result) => {
      if (result.err) {
        // Return the error message with the error status
        res.status(result.status).send(result.err);
      } else {
        res.status(result.status).send("OK");
      }
    });
  } else {
    res.status(401).send("Unauthorized");
  }
}

/**
 * Responds to HTTP request for adding sample documents to database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export function resampleDB(req: Request, res: Response) {
  // TODO: implement resampleDB()
  res.json({ dummyTest: "resampleDB() dummy test passes" });
}
