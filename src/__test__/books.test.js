'use strict';

const Book = require('../model/books');

const storage = process.env.STORAGE === 'filesystem' 
  ? require('../lib/storage/file-system') : require('../lib/storage/memory');

describe('books module tests', () => {
  test('constructor no description', () => {
    const b = new Book({
      title: 'title 1',
      author: 'author 1',
    });
    expect(b.title).toEqual('title 1');
    expect(b.author).toEqual('author 1');
    expect(b.description).toEqual('');
    expect(b.createdOn).toBeTruthy();
    expect(b._id).toBeTruthy();
  });

  test('constructor with description', () => {
    const b = new Book({
      title: 'title 1',
      author: 'author 1',
      description: 'the description',
    });
    expect(b.title).toEqual('title 1');
    expect(b.author).toEqual('author 1');
    expect(b.description).toEqual('the description');
    expect(b.createdOn).toBeTruthy();
    expect(b._id).toBeTruthy();
  });

  test('save three books', (done) => {
    new Book({
      title: 'title 1',
      author: 'author 1',
    }).save()
      .then(() => {
        new Book({
          title: 'title 2',
          author: 'author 1',
          description: 'the description of title 2',
        }).save();
      })
      .then(() => {
        new Book({
          title: 'title 3',
          author: 'author 3',
          description: 'the description of title 3',
        }).save();
      })
      .then(() => {
        expect(Object.keys(storage._mem.Books)).toHaveLength(3);
        done();
      })
      .catch((err) => {
        throw err;
      });
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
    });
    b.save()
      .then(() => {
        Book.findById(b._id)
          .then((book) => {
            expect(book.title).toEqual('title 4');
            expect(book.author).toEqual('author 3');
          })
          .catch((err) => {
            throw err;
          });
      }).catch((err) => {
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
  test('#update', (done) => {
    b = new Book({
      author: 'author 2',
      title: 'title 5',
    });
    b.save()
      .then(() => {
        b.description = 'added description';
        b.title = 'title 5b';
        Book.update(b)
          .then((result) => {
            expect(result.title).toEqual('title 5b');
            expect(result.description).toEqual('added description');
            done();
          }).catch((err) => {
            throw err;
          });
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

