import mongoose from 'mongoose';
import { CommunityDocument } from '../config/db_schemas/community.schema';
import Community, { ICommunity } from '../config/db_schemas/community.schema';
import { PostDocument } from '../config/db_schemas/post.schema';
import User from '../config/db_schemas/user.schema';
import Post from '../config/db_schemas/post.schema';
import { getProp, ServerError } from '../lib/utils.lib';
import { StatusCodes } from 'http-status-codes';

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
      throw new ServerError('Conflict', StatusCodes.CONFLICT);
    }
    // Any other database error
    throw err;
  }
}

export async function updateCommunityById(
  CommunityID: mongoose.Types.ObjectId,
  params: Partial<ICommunity>,
): Promise<CommunityDocument> {
  const resource = await Community.findOneAndUpdate(
    { _id: CommunityID },
    { $set: params },
    { new: true },
  );

  if (resource == null)
    throw new ServerError('community not found', StatusCodes.NOT_FOUND);

  return resource;
}

export async function searchCommunityById(
  id: mongoose.Types.ObjectId,
): Promise<CommunityDocument> {
  const resource = await Community.findById(id).exec();

  if (resource == null)
    throw new ServerError('community not found', StatusCodes.NOT_FOUND);

  return resource;
}

export async function getAll(): Promise<CommunityDocument[]> {
  return await Community.find({});
}

export async function getPosts(
  id: mongoose.Types.ObjectId,
): Promise<PostDocument[]> {
  const community = await Community.findById(id).exec();
  if (community == null)
    throw new ServerError('community not found', StatusCodes.NOT_FOUND);

  return await Post.find({ community: id });
}

export async function getCommunityMemberCount(
  id: mongoose.Types.ObjectId,
): Promise<number> {
  return await User.count({
    subscribedCommunities: id,
  });
}
