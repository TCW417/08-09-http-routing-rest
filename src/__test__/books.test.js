'use strict';

const Book = require('../model/books');
const storage = require('../lib/storage');

describe('books module tests', () => {
  test('constructor', () => {
    const b = new Book({
      title: 'title 1',
      author: 'author 1',
    });
    expect(b.title).toEqual('title 1');
    expect(b.author).toEqual('author 1');
    expect(b.summary).toEqual('');
    expect(b.createdOn).toBeTruthy();
    expect(b._id).toBeTruthy();
  });

  test('save three books', () => {
    new Book({
      title: 'title 1',
      author: 'author 1',
    }).save();
    new Book({
      title: 'title 2',
      author: 'author 1',
      summary: 'the summary of title 2',
    }).save();
    new Book({
      title: 'title 3',
      author: 'author 3',
      summary: 'the summary of title 3',
    }).save();
    expect(Object.keys(storage._mem.Books)).toHaveLength(3);
  });

  test('#fetch all the books', () => {
    Book.fetchAll()
      .then((all) => {
        expect(all).toHaveLength(3);
        expect(all[2].author).toEqual('author 3');
      })
      .catch((err) => {
        throw err;
      });
  });

  // this test is causing unhandled promise rejection for some reason.
  test('#fetchById', () => {
    const b = new Book({
      author: 'author 3',
      title: 'title 4',
    }).save();
    Book.findById(b._id)
      .then((book) => {
        expect(book.title).toEqual('title 4');
        expect(book.author).toEqual('author 3');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#fetchByAuthor', () => {
    Book.findByAuthor('author 3')
      .then((books) => {
        expect(books).toHaveLength(2);
        expect(books[1].title).toEqual('title 4');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#findByTitle', () => {
    Book.findByTitle('title 2')
      .then((books) => {
        expect(books).toHaveLength(1);
        expect(books[0].title).toEqual('title 2');
      })
      .catch((err) => {
        throw err;
      });
  });

  let b;
  test('#update', () => {
    b = new Book({
      author: 'author 2',
      title: 'title 5',
    });
    Book.update({
      _id: b._id,
      summary: 'added summary',
      title: 'title 5b',
    });
    Book.findById(b._id)
      .then((book) => {
        expect(book.summary).toEqual('added summary');
        expect(book.title).toEqual('title 5b');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#delete', () => {
    Book.delete(b._id)
      .then(() => {
        Book.findByTitle('title 5b')
          .then((results) => {
            expect(results).toHaveLength(0);
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

