'use strict';

// this module exports an anonymous function that is invoked from 
// server.js with the line require('../route/books-router')(router);
// the parameter, router, is a router object (see router.js).
// this function uses methods on the router to create routes to service
// requests to the server. 

const Book = require('../model/books');
const logger = require('../lib/logger');
const customResponse = require('../lib/response');

module.exports = (router) => {
  // POST to /api/v1/books
  // requires a body with title and author keys and optional description key.
  // http POST localhost:3000/api/v1/books title='this book' author='the author' for example
  router.post('/api/v1/books', (request, response) => {
    logger.log(logger.INFO, 'ROUTE-BOOKS: POST /api/v1/books');
    // the request body should be in a form suitable for passing to the Book constructor
    const newBook = new Book(request.body);
    // if the constructor left either author or title undefined, return an error
    if (!newBook.author || !newBook.title) {
      // book must include title and author
      logger.log(logger.INFO, `ROUTE-BOOKS POST: body missing title and author ${JSON.stringify(request.body)}`);
      customResponse.sendError(response, 400, 'POST body must include author and title.');
      return undefined; 
    }
    // otherwise, save the book
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

  // PUT /api/v1/books
  // update an existing book.  Requires the request.body to be a COMPLETE book object (one
  // previously instatiated by the Book constructor and returned by a GET request). 
  router.put('/api/v1/books', (request, response) => {
    logger.log(logger.INFO, 'ROUTE-BOOKS: PUT /api/v1/books/update');

    const validBook = book => book._id && book.createdOn && book.title && book.author;

    if (validBook(request.body)) {
      // the request.body is a valid book object with the required information. Update it.
      Book.update(request.body)
        .then((result) => {
          logger.log(logger.INFO, `ROUTE-BOOKS PUT: book ${result._id} updated`);
          customResponse.sendJSON(response, 200, result);
          return undefined;
        }).catch((err) => {
          logger.log(logger.ERROR, `ROUTE-BOOKS PUT: ${err.message}`);
          customResponse.sendJSON(response, 404, err.message);
          return undefined;
        });
    }
    return undefined;
  });

  // GET /api/v1/books
  // This route is pretty flexible.  It can take the following forms:
  // get by ID: /api/v1/books/?id=bookId
  // get by title: /api/v1/books/?title='book title'
  // get by author: /api/v1/books/?author='author name'
  // get all books: /api/v1/books
  router.get('/api/v1/books', (request, response) => {
    // query string has id property. use findById to retrieve the book.
    if (request.url.query.id) {
      Book.findById(request.url.query.id)
        .then((book) => {
          customResponse.sendJSON(response, 200, book);
        })
        .catch((err) => {
          customResponse.sendError(response, 404, err.message);
        });
      return undefined;
    }

    // query string has author property. use findByAuthor.
    if (request.url.query.author) {
      Book.findByAuthor(request.url.query.author)
        .then((books) => {
          customResponse.sendJSON(response, 200, books);
        })
        .catch((err) => {
          customResponse.sendError(response, 404, err.message);
        });
      return undefined;
    } 

    // query string has title property. use findByTitle.
    if (request.url.query.title) {
      Book.findByTitle(request.url.query.title)
        .then((books) => {
          customResponse.sendJSON(response, 200, books);
        })
        .catch((err) => {
          customResponse.sendError(response, 404, err.message);
        });
      return undefined;
    } 

    // query object is empty return list of all books.
    if (Object.keys(request.url.query).length === 0) {
      Book.fetchAll()
        .then((results) => {
          customResponse.sendJSON(response, 200, results);
        })
        .catch((err) => {
          throw err;
        });
      return undefined;
    }
    return undefined;
  });

  router.delete('/api/v1/books', (request, response) => {
    if (!request.url.query.id) {
      customResponse.sendError(response, 404, 'Your request requires an id');
      return undefined;
    }
    Book.delete(request.url.query.id)
      .then(() => {
        customResponse.sendJSON(response, 200, {
          Result: 'The book has been deleted',
        });
      })
      .catch((err) => {
        customResponse.sendError(response, 404, err.message);
      });
    return undefined;
  });
};
