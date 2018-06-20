'use strict';

const Book = require('../model/books');
const logger = require('../lib/logger');
const customResponse = require('../lib/response');

module.exports = (router) => {
  router.post('/api/v1/books', (request, response) => {
    logger.log(logger.INFO, 'ROUTE-BOOKS: POST /api/v1/books');
    const newBook = new Book(request.body);
    if (!newBook.author || !newBook.title) {
      // book must include title and author
      logger.log(logger.INFO, `ROUTE-BOOKS POST: body missing title and author ${JSON.stringify(request.body)}`);
      customResponse.sendError(response, 400, 'POST body must include author and title.');
      return undefined; 
    }
    newBook.save()
      .then((book) => {
        customResponse.sendJSON(response, 200, book);
        return undefined;
      })
      .catch((err) => {
        logger.log(logger.INFO, `ROUTE NOTE: There was a bad request ${JSON.stringify(err.message)}`);
        customResponse.sendError(response, 400, err.message);
        return undefined;
      });
    return undefined;
  });

  // /api/v1/books?id=12335
  router.get('/api/v1/books', (request, response) => {
    console.log('GET query:', request.url.query);
    if (!request.url.query.id) {
      customResponse.sendError(response, 404, 'Your request requires an id');
      return undefined;
    }

    Book.findOneByID(request.url.query.id)
      .then((book) => {
        customResponse.sendJSON(response, 200, book);
      })
      .catch((err) => {
        console.log(err);
        customResponse.sendError(response, 404, err.message);
      });
    return undefined;
  });
};
