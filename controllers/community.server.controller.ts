import { Response } from 'express';
import Joi, { array, string } from 'joi';
import mongoose from 'mongoose';
import { ICommunity } from '../config/db_schemas/community.schema';
import {
  convertToObjectId,
  ServerError,
  TypedRequestBody,
} from '../lib/utils.lib';
import * as Community from '../models/community.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import { validate } from '../lib/validate.lib';

interface UpdateCommunityDTO {
  name?: string;
  description?: string;
  img?: string;
}

interface CreateCommunityDTO {
  name: string;
  description: string;
  img: string;
}

interface CommunityResponse extends ICommunity {
  memberCount: number;
}

export async function communityUpdateById(
  req: TypedRequestBody<UpdateCommunityDTO>,
  res: Response<CommunityResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<UpdateCommunityDTO>({
    name: string().min(3),
    description: string().allow(['']),
    img: array().items(string().uri()).max(3),
  }).min(1);

  const data = validate(schema, req.body);

  const id = convertToObjectId(req.params.id);
  const community = await Community.searchCommunityById(id);

  if (!(await User.isUserAuthorized(community.owner, authToken))) {
    throw new ServerError('forbidden', 403);
  }

  const newCommunity = await Community.updateCommunityById(id, data);

  res.status(200).send({
    img: newCommunity.img,
    name: newCommunity.name,
    owner: newCommunity.owner,
    memberCount: await Community.getCommunityMemberCount(id),
    description: newCommunity.description,
    posts: newCommunity.posts,
    createdAt: newCommunity.createdAt,
    updatedAt: newCommunity.updatedAt,
  });
}

export async function communityCreate(
  req: TypedRequestBody<CreateCommunityDTO>,
  res: Response<CommunityResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<CreateCommunityDTO>({
    name: string().min(3).required(),
    description: string().allow(['']).required(),
    img: array().items(string().uri()).max(3).required(),
  });

  const data = validate(schema, req.body);

  const user = await User.searchUserByAuthToken(authToken);
  const community = await Community.insertCommunity({
    owner: user._id,
    ...data,
  });

  res.status(201).send({
    img: community.img,
    name: community.name,
    owner: community.owner,
    memberCount: await Community.getCommunityMemberCount(community._id),
    description: community.description,
    posts: community.posts,
    createdAt: community.createdAt,
    updatedAt: community.updatedAt,
  });
}
