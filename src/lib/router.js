'use strict';

const logger = require('./logger');
const bodyParser = require('./body-parser');
const customResponse = require('./response');


module.exports = class Router {
  // the object keys correspond to RESTful verbs. The methods below
  // will populate this's properties with {'/path', callback(res, req)}
  // pairs.  With this, the router can use the request method to
  // find the path (and validate it) and, if valid, call the function
  // associated with that route.
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
  }
 
  // The following four functions populate the route
  // object with "VERB /path => callback(req, res)"
  // properties. Endpoint is the path, callback is
  // the function passed (req, res) to process the route
  // request.

  get(endpoint, callback) {
    this.routes.GET[endpoint] = callback;
  }

  post(endpoint, callback) {
    this.routes.POST[endpoint] = callback;
  }

  put(endpoint, callback) {
    this.routes.PUT[endpoint] = callback;
  }
  delete(endpoint, callback) {
    this.routes.DELETE[endpoint] = callback;
  }

  // This is the heart of the server.
  // route returns a FUNCTION that is passed to 
  // createServer in server.js. That function is invoked
  // for each request recieved and passed the request
  // and response objects.
  // 
  // route's callback returns undefined under all 
  // circumstances.
  //
  // for each request received it calls bodyParser.
  // if BP succeeds (returns resolved promise) route
  // finds the route processing function by using the
  // request method and request url pathname as key
  // names in the route object ("this"). That  function
  // is then called wtih the request and response objects
  // received by the server.
  route() {
    return (request, response) => {
      Promise.all([bodyParser(request)]) 
        .then(() => {
          logger.log(logger.INFO, `Router rec'd: ${request.method} ${request.url.pathname}`);
          // the line below retrieves the ROUTE callback using the request method and pathname
          // as route (this) object keys.
          const requestResponseCallback = this.routes[request.method][request.url.pathname];
          const isFunction = typeof requestResponseCallback === 'function';
          if (isFunction) return requestResponseCallback(request, response);
          
          customResponse.sendError(response, 404, `API path ${request.url.pathname} not found.`);
          return undefined;
        })
        .catch((err) => {
          console.log('!!!!!!!!!! router error catch entered');
          logger.log(logger.INFO, JSON.stringify(err));
          customResponse.sendError(response, 400, 'Bad request received.');
          return undefined;
        });
    };
  }
};

