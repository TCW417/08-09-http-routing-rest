'use strict';

const http = require('http');

const server = module.exports = {};
const logger = require('./logger');
const Router = require('./router');

// create a router object with methods to create route
// endpoints and "route()" which processes each request
// received by the server. route() returns undefined.
const router = new Router();

// This line invokes a function that calls router methods
// to create the routes needec by the application. 
// routes are created with an anonymous callback(req, res)
// that does the actual route processing. Endpoint callbacks
// return undefined.
require('../route/books-router')(router);

// Now we create the server, passing it the RETURN VALUE
// of router.route() which is a function that does the
// processing on each received request.
const app = http.createServer(router.route());

server.start = (port, callback) => app.listen(port, callback);
server.stop = () => app.close(() => logger.log(logger.INFO, 'SERVER: Stopped'));
