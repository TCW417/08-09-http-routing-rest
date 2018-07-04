'use strict';

const uuid = require('uuid/v4');
if (!process.env.STORAGE) require('dotenv').config();

const storage = process.env.STORAGE === 'filesystem' 
  ? require('../lib/storage/file-system') : require('../lib/storage/memory');

// const storage = require('../lib/storage/memory');

module.exports = class Book {
  // Book constructor takes an object of the form 
  // { 
  //    title: "book title",
  //    author: "author",
  //    description: "description of the book"
  // }
  // title and author are required. Summary is optional.
  // each new book is given a unique id (uuid) to use as 
  // its "database" key.
  constructor(bookInfo) {
    this._id = uuid();
    this.createdOn = new Date().toISOString();
    this.title = bookInfo.title;
    this.author = bookInfo.author;
    this.description = bookInfo.description || '';
  }

  save() {
    return storage.save('Books', this);
  }

  static fetchAll() {
    return storage.getAll('Books');
  }

  static findById(_id) {
    return storage.get('Books', _id);
  }

  static findByAuthor(author) {
    return storage.getByKey('Books', { author });
  }

  static findByTitle(title) {
    return storage.getByKey('Books', { title });
  }

  static update(data) {
    // TODO: Bonus to write code here teo update a user in the storage module by targeting their ID
    return storage.update('Books', data);
  }

  static delete(_id) {
    // TODO: write code here to delete a user in the storage module by targeting their id
    return storage.delete('Books', _id);
  }
};
