'use strict';

const logger = require('./logger');
const bodyParser = require('./body-parser');
const customResponse = require('./response');


module.exports = class Router {
  constructor() {
    this.routes = {
      GET: {
      // Just a hard-coded example
      // '/api/v1/note': (req, res) => {},
      // '/api/v1/note?id': (req, res) => {},
      },
      POST: {},
      PUT: {},
      DELETE: {},
    };
  }

  /*eslint-disable*/
  
  // The following four functions populate the route
  // object with "VERB /path => callback(req, res)"
  // properties. Endpoint is the path, callback is
  // the function passed req, res to process the route.

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
  // route returns a CALLBACK that is passed to 
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
          const requestResponseCallback = this.routes[request.method][request.url.pathname];
          const isFunction = typeof requestResponseCallback === 'function';
          if (isFunction) return requestResponseCallback(request, response);
          
          customResponse.sendError(response, 404, `API path ${request.url.pathname} not found.`);
          return undefined;
        })
        .catch((err) => {
          logger.log(logger.INFO, JSON.stringify(err));
          // This might be better as a 400 perhaps
          customResponse.sendError(response, 400, 'Bad request received.');
          return undefined;
        });
    };
  }
};

