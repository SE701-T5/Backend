import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { closeConn, connect } from '../config/db.server.config';

type RemoveLast<T extends unknown[]> = T extends [...infer Head, unknown]
  ? Head
  : unknown[];

type GetStandardCallback<T> = T extends (
  ...args: [...unknown[], infer TCallback]
) => unknown
  ? TCallback
  : never;

type GetCallbackArgs<T> = T extends (
  ...args: [infer TCallback, ...infer TRest]
) => unknown
  ? TRest extends []
    ? TCallback
    : [TCallback, ...TRest]
  : never;

export function customPromisify<Tfn extends (...args: unknown[]) => unknown>(
  fn: Tfn,
): (
  ...args: RemoveLast<Parameters<Tfn>>
) => Promise<GetCallbackArgs<GetStandardCallback<Tfn>>> {
  return (...args) =>
    new Promise((resolve) => {
      function customCallback(...results: unknown[]) {
        return resolve(
          (results.length === 1 ? results[0] : results) as GetCallbackArgs<
            GetStandardCallback<Tfn>
          >,
        );
      }
      args.push(customCallback);
      fn.call(this, ...args);
    });
}

export const mochaHooks = {
  async beforeAll() {
    this.timeout('60s');
    console.error('starting server');

    this.mongoServer = await MongoMemoryServer.create();
    this.databaseURI = this.mongoServer.getUri() + 'tests';

    console.log(`MongoDB server started at ${this.databaseURI}`);

    await closeConn();
    await connect(this.databaseURI, {});
  },

  async beforeEach() {
    // The following is to make sure the database is clean before a test starts
    await mongoose.connection.db.dropDatabase();
  },

  async afterAll() {
    await closeConn();
    await this.mongoServer.stop();
    console.log('MongoDB server stopped!');
  },
};
