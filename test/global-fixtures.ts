import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";

export const mochaHooks = {
	async beforeAll() {
		this.timeout('60s')
		console.error('starting server');

		this.server = await MongoMemoryServer.create();
		const uri = this.server.getUri() + 'tests';

		console.log(`MongoDB server started at ${uri}`);

		if (mongoose.connection) {
			mongoose.disconnect()
		}

		// The following is to make sure the database is clean before a test starts
		await mongoose.connect(uri, {});
		await mongoose.connection.db.dropDatabase();
		await mongoose.disconnect();
	},

	async afterAll() {
		console.log('closing MongoDB server')
		await this.server.stop();
		console.log('MongoDB server stopped!');
	}
}



