export class ServerError {
  public constructor(
    public err: string,
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
