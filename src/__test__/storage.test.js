'use strict';

const storage = require('../lib/storage');

describe('Storage module tests', () => {
  test('#storage.save', () => {
    storage.save('test', { _id: 123, value: 'a string' });
    storage.get('test', 123)
      .then((result) => {
        expect(result._id).toEqual(123);
        expect(result.value).toEqual('a string');
      })
      .catch((err) => {
        throw err;
      });
  });
});
