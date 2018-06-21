'use strict';

/* eslint-disable */
const superagent = require('superagent');
const server = require('../lib/server');
const Book = require('../model/books');
const memory = require('../lib/storage')._mem;

const apiUrl = 'http://localhost:5000/api/v1/books';

const mockResource = {
  title: 'test title',
  author: 'test author',
};

beforeAll(() => server.start(5000));
afterAll(() => server.stop());

describe('POST to /api/v1/books', () => {
  test('200 for successful saving of a new book', () => {
    return superagent.post(apiUrl)
      .send(mockResource)
      .then((response) => {
        expect(response.body.title).toEqual(mockResource.title);
        expect(response.body.author).toEqual(mockResource.author);
        expect(response.body._id).toBeTruthy();
        expect(response.status).toEqual(200);
      })
      .catch((err) => {
        // I still want to handle errors in the catch block in case we fail
        throw err;
      });
  });

  test('400 for a bad request', () => {
    return superagent.post(apiUrl)
      .send({})
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
        expect(err).toBeInstanceOf(Error);
      });
  });
});

describe('GET /api/v1/books', () => {
  let mockResourceForGet;
  beforeEach(() => {
    const newBook = new Book(mockResource);
    newBook.save()
      .then((book) => {
        mockResourceForGet = book;
      })
      .catch((err) => {
        throw err;
      });
  });

  test('200 successful GET request', () => {
    return superagent.get(`${apiUrl}?id=${mockResourceForGet._id}`)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual(mockResourceForGet.title);
        expect(response.body.author).toEqual(mockResourceForGet.author);
        expect(response.body.createdOn).toEqual(mockResourceForGet.createdOn);
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('DELETE /api/v1/books', () => {
  let mockResourceForGet;
  beforeAll(() => {
    const newBook = new Book(mockResource);
    newBook.save()
      .then((book) => {
        mockResourceForGet = book;
      })
      .catch((err) => {
        throw err;
      });
  });

  test('200 successful DELETE request', () => {
    return superagent.delete(`${apiUrl}?id=${mockResourceForGet._id}`)
      .then((response) => {
        expect(response.status).toEqual(200);
      })
      .catch((err) => {
        throw err;
      });
  });

    test('404 Failed DELETE request', () => {
      return superagent.delete(`${apiUrl}?id=${mockResourceForGet._id}`)
        .then((err) => {
          throw err;
        })
        .catch((response) => {
          expect(response.status).toEqual(404);
          expect(response.body).toBeUndefined();
        })
        .catch((err) => {
          throw err;
        });
    });
});

describe('GET /api/v1/books with no query string', () => {
  beforeAll(() => {
    new Book({
      author: 'author 1',
      title: 'title 1',
      summary: 'a summary,'
    }).save();
    new Book({
      author: 'author 1',
      title: 'title 2',
    }).save();
    new Book({
      author: 'author 1',
      title: 'title 3',
      summary: 'a summary,'
    }).save();
  });

  test('200 successful GET request with no query string', () => {
    return superagent.get(`${apiUrl}`)
      .then((response) => {
        // console.log(response.body);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(5);
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('GET requests quering author and title', () => {
  beforeAll(() => {
    new Book({
      author: 'author 1',
      title: 'title 1',
      summary: 'a summary,'
    }).save();
    new Book({
      author: 'author 2',
      title: 'title 2',
    }).save();
    new Book({
      author: 'author 1',
      title: 'title 3',
      summary: 'a summary,'
    }).save();
  });

  test('GET all author 1 books', () => {
    // console.log(JSON.stringify(memory, null, 2));
    return superagent.get(`${apiUrl}`)
      .query({
        author: 'author 1',
      })
      .then((response) => {
        // console.log()
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(5);
      })
      .catch((err) => {
        throw err;
      });
    });

    test('GET all author X (unfound)', () => {
      return superagent.get(`${apiUrl}`)
        .query({
          author: 'not found',
        })
        .then((result) => {
          expect(result.body).toHaveLength(0);
        });
    });
});

