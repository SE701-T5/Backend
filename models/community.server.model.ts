import mongoose from 'mongoose';
import Comment, { CommentDocument } from '../config/db_schemas/comment.schema';
import { CommunityDocument } from '../config/db_schemas/community.schema';
import Community, { ICommunity } from '../config/db_schemas/community.schema';
import { getProp, ServerError } from '../lib/utils.lib';

interface CreateCommunityDTO {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  img?: string;
}

export async function insertCommunity(params: CreateCommunityDTO) {
  // Create new Community document
  const newCommunity = new Community(params);

  // Save new Community document to database collection
  try {
    return await newCommunity.save();
  } catch (err: unknown) {
    if (getProp(err, 'code') === 11000) {
      throw new ServerError('Conflict', 409);
    }
    // Any other database error, return internal server error
    throw new ServerError('Internal server error', 500);
  }
}

export async function updateCommunityById(
  CommunityID: mongoose.Types.ObjectId,
  params: Partial<ICommunity>,
): Promise<CommunityDocument> {
  let resource: CommunityDocument;
  try {
    resource = await Community.findOneAndUpdate(
      { _id: CommunityID },
      { $set: params },
      { new: true },
    );
  } catch (err) {
    throw new ServerError('unexpected server error', 500, err);
  }
  if (resource != null) {
    return resource;
  } else {
    throw new ServerError('community not found', 400);
  }
}

export async function searchCommunityById(
  id: mongoose.Types.ObjectId,
): Promise<CommunityDocument> {
  let resource: CommunityDocument;

  try {
    resource = await Community.findById(id);
  } catch (err) {
    throw new ServerError('Internal server error', 500, err);
  }

  if (resource != null) return resource;
  else {
    throw new ServerError('community not found', 404);
  }
}
