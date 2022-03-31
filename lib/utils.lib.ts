import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

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
