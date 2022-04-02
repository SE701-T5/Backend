import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import { ICommunity } from '../config/db_schemas/community.schema';
import {
  convertToObjectId,
  ServerError,
  TypedRequestBody,
} from '../lib/utils.lib';
import * as Community from '../models/community.server.model';
import * as Forum from '../models/forum.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import { validate } from '../lib/validate.lib';
import { PostResponse } from './forum.server.controller';
import { StatusCodes } from 'http-status-codes';

interface UpdateCommunityDTO {
  name?: string;
  description?: string;
  img?: string;
}

interface CreateCommunityDTO {
  name: string;
  description: string;
  img?: string;
}

interface CommunityResponse extends ICommunity {
  id: mongoose.Types.ObjectId;
  memberCount: number;
}

export async function getPosts(req: Request, res: Response<PostResponse[]>) {
  const id = convertToObjectId(req.params.id);
  const posts = await Forum.populatePosts(await Community.getPosts(id));

  const response = posts.map(
    (post) =>
      ({
        id: post._id,
        owner: post.owner,
        community: {
          id: post.community._id,
          name: post.community.name,
        },
        title: post.title,
        bodyText: post.bodyText,
        edited: post.edited,
        upVotes: post.upVotes,
        attachments: post.attachments,
        downVotes: post.downVotes,
        comments: post.comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      } as PostResponse),
  );

  res.status(StatusCodes.OK).send(response);
}

export async function communityUpdateById(
  req: TypedRequestBody<UpdateCommunityDTO>,
  res: Response<CommunityResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<UpdateCommunityDTO>({
    name: Joi.string().min(3),
    description: Joi.string().allow(''),
    img: Joi.string().uri(),
  }).min(1);

  const data = validate(schema, req.body);

  const id = convertToObjectId(req.params.id);
  const community = await Community.searchCommunityById(id);

  if (!(await User.isUserAuthorized(community.owner, authToken))) {
    throw new ServerError('forbidden', StatusCodes.FORBIDDEN);
  }

  const newCommunity = await Community.updateCommunityById(id, data);

  res.status(StatusCodes.OK).send({
    id: newCommunity._id,
    img: newCommunity.img,
    name: newCommunity.name,
    owner: newCommunity.owner,
    memberCount: await Community.getCommunityMemberCount(id),
    description: newCommunity.description,
    createdAt: newCommunity.createdAt,
    updatedAt: newCommunity.updatedAt,
  });
}

export async function getCommunities(
  req: Request,
  res: Response<CommunityResponse[]>,
) {
  const communities = await Community.getAll();

  const mappedCommunities: CommunityResponse[] = await Promise.all(
    communities.map(async (doc) => ({
      id: doc._id,
      img: doc.img,
      name: doc.name,
      owner: doc.owner,
      memberCount: await Community.getCommunityMemberCount(doc._id),
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
  );

  res.status(StatusCodes.OK).send(mappedCommunities);
}

export async function communityCreate(
  req: TypedRequestBody<CreateCommunityDTO>,
  res: Response<CommunityResponse>,
) {
  const authToken = req.get(config.get('authToken'));

  const schema = Joi.object<CreateCommunityDTO>({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow('').required(),
    img: Joi.string().uri(),
  });

  const data = validate(schema, req.body);

  const user = await User.searchUserByAuthToken(authToken);
  const community = await Community.insertCommunity({
    owner: user._id,
    ...data,
  });

  res.status(StatusCodes.CREATED).send({
    id: community._id,
    img: community.img,
    name: community.name,
    owner: community.owner,
    memberCount: await Community.getCommunityMemberCount(community._id),
    description: community.description,
    createdAt: community.createdAt,
    updatedAt: community.updatedAt,
  });
}
