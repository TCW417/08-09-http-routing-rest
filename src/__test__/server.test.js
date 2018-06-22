'use strict';


const superagent = require('superagent');
const fs = require('fs');
const server = require('../lib/server');
const Book = require('../model/books');
const storage = process.env.STORAGE === 'filesystem' 
  ? require('../lib/storage/file-system') : require('../lib/storage/memory');

const apiUrl = 'http://localhost:5000/api/v1/books';

const mockResource = {
  title: 'test title',
  author: 'test author',
  description: 'the description',
};
beforeAll(() => {
  server.start(5000);
  if (process.env.STORAGE === 'filesystem') {
    const files = fs.readdirSync(`${storage.dataFd}/Books`);
    files.forEach(file => 
      fs.unlinkSync(`${storage.dataFd}/Books/${file}`));
    fs.rmdirSync(`${storage.dataFd}/Books/`);
  }
  storage._mem = {}; // just in case
});

afterAll(() => {
  server.stop();
});

describe('POST to /api/v1/books', () => {
  test('200 for successful saving of a new book', () => {
    expect.assertions(5);
    return superagent.post(apiUrl)
      .send(mockResource)
      .then((response) => {
        expect(response.body.title).toEqual(mockResource.title);
        expect(response.body.author).toEqual(mockResource.author);
        expect(response.body.description).toEqual(mockResource.description);
        expect(response.body._id).toBeTruthy();
        expect(response.status).toEqual(200);
      })
      .catch((err) => {
        // I still want to handle errors in the catch block in case we fail
        throw err;
      });
  });

  test('400 for a bad request', () => {
    expect.assertions(2);
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
    return newBook.save()
      .then((book) => {
        mockResourceForGet = book;
      })
      .catch((err) => {
        throw err;
      });
  });

  test('200 successful GET request', () => {
    expect.assertions(4);
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
    return newBook.save()
      .then((book) => {
        mockResourceForGet = book;
      })
      .catch((err) => {
        throw err;
      });
  });

  test('200 successful DELETE request', () => {
    expect.assertions(1);
    return superagent.delete(`${apiUrl}?id=${mockResourceForGet._id}`)
      .then((response) => {
        expect(response.status).toEqual(200);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('404 Failed DELETE request', () => {
    expect.assertions(2);
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
    const p1 = new Promise(() => {
      new Book({
        author: 'author 1',
        title: 'title 1',
        description: 'a description',
      }).save();
    });
    const p2 = new Promise(() => {
      new Book({
        author: 'author 1',
        title: 'title 2',
      }).save();
    });
    const p3 = new Promise(() => {
      new Book({
        author: 'author 1',
        title: 'title 3',
        description: 'a description',
      }).save();
    });
    Promise.all([p1, p2, p3])
      .then()
      .catch(); 
  });

  test('200 successful GET request with no query string', () => {
    expect.assertions(2);
    return superagent.get(`${apiUrl}`)
      .then((response) => {
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
    const p1 = new Promise(() => {
      new Book({
        author: 'author 1',
        title: 'title 1',
        description: 'a description',
      }).save();
    });
    const p2 = new Promise(() => {
      new Book({
        author: 'author 2',
        title: 'title 2',
      }).save();
    });
    const p3 = new Promise(() => {
      new Book({
        author: 'author 1',
        title: 'title 3',
        description: 'a description',
      }).save();
    });
    Promise.all([p1, p2, p3])
      .then()
      .catch(); 
  });
  test('GET all author 1 books', () => {
    expect.assertions(2);
    return superagent.get(`${apiUrl}`)
      .query({
        author: 'author 1',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(5);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('GET all author X (unfound)', () => {
    expect.assertions(1);
    return superagent.get(`${apiUrl}`)
      .query({
        author: 'not found',
      })
      .then((result) => {
        expect(result.body).toHaveLength(0);
      });
  });
});

describe('PUT (update) tests', () => {
  let cachedBooks;
  test('PUT with valid book object', (done) => {
    const updateTest = (result) => {
      expect(result.status).toEqual(200);
      expect(result.body.title).toEqual('A New Title');
    };

    expect.assertions(2);
    return Book.findByAuthor('author 1')
      .then((books) => {
        cachedBooks = books.slice();
        const book = books[0];
        book.title = 'A New Title';
        superagent.put(`${apiUrl}`)
          .send(JSON.stringify(book))
          .then((result) => {
            updateTest(result);
            done();
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });

  test('PUT with invalid _id on book', (done) => {
    const badBook = cachedBooks[1];
    badBook._id = 'nonexistent id';
    expect.assertions(1);
    return superagent(`${apiUrl}/update`)
      .send(JSON.stringify(badBook))
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.status).toEqual(404);
        done();
      });
  });
});
