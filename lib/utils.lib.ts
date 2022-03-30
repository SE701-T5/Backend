export class ServerError {
  public constructor(
    public desc: string,
    public code: number,
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
