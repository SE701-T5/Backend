import Joi from 'joi';
import { TypedRequestBody } from '../lib/utils.lib';
import { validate } from '../lib/validate.lib';
import { ResampleCounts, ResampleDTO } from '../models/db.server.model';
import * as Database from '../models/db.server.model';
import { Request, Response } from 'express';

/**
 * Responds to HTTP request for removing all documents from database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function resetDB(req: Request, res: Response) {
  // Remove all documents in the database collections
  await Database.resetCollections();
  res.status(204).send();
}

/**
 * Responds to HTTP request for adding sample documents to database collections
 * @param req HTTP request object
 * @param res HTTP request response object
 */
export async function resampleDB(
  req: TypedRequestBody<ResampleDTO>,
  res: Response<ResampleCounts>,
) {
  const schema = Joi.object<ResampleDTO>({
    users: Joi.number().min(1).max(100).integer(),
    communities: Joi.number().min(1).max(100).integer(),
    posts: Joi.alternatives(
      Joi.number().min(1).max(20).integer(),
      Joi.array().items(Joi.number().min(1).max(20).integer()).length(2),
    ),
    comments: Joi.alternatives(
      Joi.number().min(1).max(10).integer(),
      Joi.array().items(Joi.number().min(1).max(10).integer()).length(2),
    ),
  });

  const data = validate(schema, req.body);

  const counts = await Database.generateFakeData(data);
  res.status(200).send(counts);
}
