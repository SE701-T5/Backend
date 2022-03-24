import {Express} from 'express';
import * as database from '../controllers/db.server.controller';

/**
 * Handles HTTP requests for the Database module using Express.js route()
 * @param app Express.js application object
 */
export default function (app: Express) {
	app.route('/api/v1/reset')
		.post(database.resetDB);

	app.route('/api/v1/resample')
		.post(database.resampleDB);
}
