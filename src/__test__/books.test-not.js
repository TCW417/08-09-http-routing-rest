'use strict';

if (!process.env.STORAGE) require('dotenv').config();

const fs = require('fs');
const Book = require('../model/books');

const storage = process.env.STORAGE === 'filesystem' 
  ? require('../lib/storage/file-system') : require('../lib/storage/memory');

console.log('>>>>>>> books.test..js STORAGE:', process.env.STORAGE);
console.log('>>>>>>> books.test.js _mem visible?', !!storage._mem);

beforeAll(() => {
  if (process.env.STORAGE === 'filesystem') {
    const files = fs.readdirSync(`${storage.dataFd}/Books`);
    files.forEach(file => 
      fs.unlinkSync(`${storage.dataFd}/Books/${file}`));
    fs.rmdirSync(`${storage.dataFd}/Books/`);
  }
  storage._mem = {}; // just in case
});

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

  test('save three books', () => {
    const promise0 = new Promise(() => {
      new Book({
        title: 'title to delete',
        author: 'author to delete',
      }).save();
    });
    const promise1 = new Promise(() => {
      new Book({
        title: 'title 1',
        author: 'author 1',
      }).save();
    });
    const promise2 = new Promise(() => {
      new Book({
        title: 'title 1.2',
        author: 'author 1',
        description: 'the description of title 2',
      }).save();
    });
    const promise3 = new Promise(() => {
      new Book({
        title: 'title 3',
        author: 'author 3',
        description: 'the description of title 3',
      }).save();
    });
    Promise.all([promise0, promise1, promise2, promise3])
      .then(() => {
        expect.assertions(1);
        return Book.fetchAll()
          .then((all) => {
            expect(all).toHaveLength(3);
          })
          .catch((err) => {
            throw err;
          });
      });
  });

  test('#fetch all the books', () => {
    expect.assertions(1);
    return Book.fetchAll()
      .then((all) => {
        expect(all).toHaveLength(4);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#fetchById', () => {
    const b = new Book({
      author: 'author 3', // there's only one
      title: 'title 4',
    });
    const p1 = new Promise(() => { b.save(); });
    Promise.all([p1])
      .then((book) => {
        console.log('promise resolved', book);
        expect.assertions(2);
        console.log('calling findById with', book._id);
        return Book.findById(book._id)
          .then((book2) => {
            console.log('back from fetchbyId', book);
            expect(book2.title).toEqual(book.title);
            expect(book2.author).toEqual(book.author);
          })
          .catch((err) => {
            throw err;
          });
      }).catch((err) => {
        throw err;
      }); 
  });

  test('#fetchByAuthor', () => {
    expect.assertions(1);
    return Book.findByAuthor('author 1')
      .then((books) => {
        expect(books).toHaveLength(2);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#findByTitle', () => {
    expect.assertions(1);
    return Book.findByTitle('title 1')
      .then((books) => {
        expect(books).toHaveLength(1);
        // expect(books[0].title).toEqual('title 2');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#update', () => {
    const book0 = new Book({
      author: 'author 2',
      title: 'title 5',
    });
    book0.save()
      .then((book1) => {
        book1.description = 'added description';
        book1.title = 'title 5b';
        expect.assertions(2);
        return Book.update(book1)
          .then((result) => {
            expect(result.title).toEqual('title 5b');
            expect(result.description).toEqual('added description');
          }).catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });


  test('#delete', () => {
    Book.findByAuthor('author to delete') // should only one of these
      .then((book) => {
        expect.assertions(1);
        return Book.delete(book[0]._id)
          .then((result) => {
            expect(result).toEqual('Success');
            // Book.findByTitle('title 5b')
            //   .then((results) => {
            //     expect(results).toHaveLength(0);
            //   });
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});
