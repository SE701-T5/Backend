import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import mongoose from 'mongoose';

export class ServerError extends Error {
  public constructor(
    message: string,
    public status: number,
    public context?: unknown,
  ) {
    super(message);
  }
}

export function getProp(o: unknown, prop: string): unknown {
  try {
    return o[prop];
  } catch {
    // ignore
  }
  return undefined;
}

export type TypedRequestBody<T> = Request<ParamsDictionary, any, T>;

export interface TimestampedModel {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function convertToObjectId(id: string): mongoose.Types.ObjectId {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (e) {
    throw new ServerError('id is an invalid format', 400, e);
  }
}
