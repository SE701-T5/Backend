import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { closeConn, connect } from "../config/db.server.config";

export const mochaHooks = {
  async beforeAll() {
    this.timeout("60s");
    console.error("starting server");

    this.mongoServer = await MongoMemoryServer.create();
    this.databaseURI = this.mongoServer.getUri() + "tests";

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
    console.log("MongoDB server stopped!");
  },
};
