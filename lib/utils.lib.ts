export class ServerError {
  public constructor(
    public desc: string,
    public status: number,
    public context?: unknown,
  ) {}
}

export function getProp(o: unknown, prop: string): unknown {
  try {
    return o[prop];
  } catch {
    // ignore
  }
  return undefined;
}

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}
