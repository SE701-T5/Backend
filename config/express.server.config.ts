import express from 'express';
import bodyParser from 'body-parser';

import dbServerRoutes from '../routes/db.server.routes';
import forumServerRoutes from '../routes/forum.server.routes';
import userServerRoutes from '../routes/user.server.routes';

/**
 * Configure Express.js application
 * @returns Express.js application object
 */
export default function () {
	// Create Express.js application
	const app = express();

	// This is required for parsing application/json in req.body
	app.use(bodyParser.json());

	// Set response headers using middleware
	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Authorization, Origin, X-Requested-With, Content-Type, Accept');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
		next();
	});

	// HTTP GET request to homepage with a message response stating the server is running
	app.get('/health', function(req, res){
		res.status(200).json({ 'msg': 'The server is up and running!' });
	});

	// Configure HTTP routes
	dbServerRoutes(app);
	forumServerRoutes(app);
	userServerRoutes(app);

	return app;
}
