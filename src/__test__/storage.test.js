'use strict';

const storage = require('../lib/storage');

describe('Storage module tests', () => {
  test('#storage.save', () => {
    storage.save('test', { _id: 123, value: 'a string' })
      .then((result) => {
        expect(storage._mem.test[123].value).toEqual('a string');
        expect(result._id).toEqual(123);
      })
      .catch((err) => {
        throw err;
      });
  });
  

  test('#storage.get good id', () => {
    storage.get('test', 123)
      .then((result) => {
        expect(result._id).toEqual(123);
        expect(result.value).toEqual('a string');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#storage.get bad id', () => {
    storage.get('test', 999)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('999 not found');
      });
  });

  test('#storage.getAll good schema', () => {
    storage.save('test', { _id: 456, value: 'a string' })
      .then(() => {
        storage.getAll('test')
          .then((result2) => {
            expect(result2).toHaveLength(2);
            expect(result2[0].value).toEqual('a string');
            expect(result2[1].value).toEqual('a string');
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#storage.getAll bad schema', () => {
    storage.getAll('bad')
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('Schema bad not found');
      });
  });

  test('#storage.getByKey success', () => {
    storage.getByKey('test', { value: 'a string' })
      .then((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].value).toEqual('a string');
      })
      .catch((err) => { throw err; });
  });

  test('#storage.getByKey bad schema', () => {
    storage.getByKey('bad', { value: 999 })
      .then((err) => { throw err; })
      .catch((result) => {
        expect(result.message).toEqual('Schema bad not found');
      }); 
  });

  test('#storage.getByKey no match', () => {
    storage.getByKey('test', { value: 999 })
      .then((result) => {
        expect(result).toHaveLength(0);
      })
      .catch((err) => { throw err; });
  });

  test('#storage.delete good request', () => {
    storage.delete('test', 456)
      .then((result) => {
        expect(result.value).toEqual('a string');
        expect(storage._mem.test[456]).toBeUndefined();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#storage.delete bad request', () => {
    storage.delete('test', 456)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('Schema test and/or ID 456 not found');
      });
  });

  test('#storage.upate good ID', () => {
    storage.update('test', { _id: 123, value: 'a new string' })
      .then((result) => {
        expect(result.value).toEqual('a new string');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#storage.update good ID continued...', () => {
    storage.get('test', 123)
      .then((result) => {
        expect(result.value).toEqual('a new string');
      })
      .catch((err) => {
        throw err;
      });
  });
});
