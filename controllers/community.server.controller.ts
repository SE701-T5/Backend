import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ICommunity } from '../config/db_schemas/community.schema';
import { ServerError, TypedRequestBody } from '../lib/utils.lib';
import * as Community from '../models/community.server.model';
import * as User from '../models/user.server.model';
import config from '../config/config.server.config';
import {
  getValidValues,
  validateForm,
  isValidDocumentID,
  IValidation,
} from '../lib/validate.lib';

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

export async function communityUpdateById(
  req: TypedRequestBody<UpdateCommunityDTO>,
  res: Response<ICommunity>,
) {
  const authToken = req.get(config.get('authToken'));

  // Set community fields to an object for passing to the model
  const communityParams: IValidation<UpdateCommunityDTO> = {
    name: {
      valid: req.body.name != undefined && req.body.name.length > 0,
      value: req.body.name,
      required: false,
    },
    description: {
      valid: req.body.description != undefined,
      value: req.body.description,
      required: false,
    },
    img: {
      valid: req.body.img != undefined,
      value: req.body.img,
      required: false,
    },
  };

  if (!validateForm(communityParams) && isValidDocumentID(req.params.id)) {
    throw new ServerError('Bad request', 400);
  }

  const id = new mongoose.Types.ObjectId(req.params.id);
  const community = await Community.searchCommunityById(id);

  if (!(await User.isUserAuthorized(community.owner, authToken))) {
    throw new ServerError('forbidden', 403);
  }

  const newCommunity = await Community.updateCommunityById(
    id,
    getValidValues(communityParams),
  );

  res.status(200).send({
    img: newCommunity.img,
    name: newCommunity.name,
    owner: newCommunity.owner,
    members: newCommunity.members,
    description: newCommunity.description,
  });
}

export async function communityCreate(
  req: TypedRequestBody<CreateCommunityDTO>,
  res: Response<ICommunity>,
) {
  const authToken = req.get(config.get('authToken'));

  // Set community fields to an object for passing to the model
  const communityParams: IValidation<CreateCommunityDTO> = {
    name: {
      value: req.body.name,
      valid: req.body.name.length > 0,
    },
    img: {
      value: req.body.img,
      valid: true,
    },
    description: {
      value: req.body.description,
      valid: req.body.description != undefined,
    },
  };

  if (!validateForm(communityParams)) {
    throw new ServerError('bad request', 400);
  }

  const user = await User.searchUserByAuthToken(authToken);
  const community = await Community.insertCommunity({
    owner: user._id,
    ...getValidValues(communityParams),
  });

  res.status(201).send({
    img: community.img,
    name: community.name,
    owner: community.owner,
    members: community.members,
    description: community.description,
  });
}
