'use strict';

const storage = require('../lib/storage/memory');

describe('Memor Storage module tests', () => {
  test('#memory storage.save', () => {
    expect.assertions(2);
    return storage.save('memTest', { _id: 123, value: 'a string' })
      .then((result) => {
        expect(storage._mem.memTest[123].value).toEqual('a string');
        expect(result._id).toEqual(123);
      })
      .catch((err) => {
        throw err;
      });
  });
  

  test('#memory storage.get good id', () => {
    expect.assertions(2);
    return storage.get('memTest', 123)
      .then((result) => {
        expect(result._id).toEqual(123);
        expect(result.value).toEqual('a string');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#memory storage.get bad id', () => {
    expect.assertions(1);
    return storage.get('memTest', 999)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('999 not found');
      });
  });

  test('#memory storage.getAll good schema', () => {
    expect.assertions(3);
    return storage.save('memTest', { _id: 456, value: 'a string' })
      .then(() => {
        storage.getAll('memTest')
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

  test('#memory storage.getAll bad schema', () => {
    expect.assertions(1);
    return storage.getAll('bad')
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('Schema bad not found');
      });
  });

  test('#memory storage.getByKey success', () => {
    expect.assertions(2);
    return storage.getByKey('memTest', { value: 'a string' })
      .then((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].value).toEqual('a string');
      })
      .catch((err) => { throw err; });
  });

  test('#memory storage.getByKey bad schema', () => {
    expect.assertions(1);
    return storage.getByKey('bad', { value: 999 })
      .then((err) => { throw err; })
      .catch((result) => {
        expect(result.message).toEqual('Schema bad not found');
      }); 
  });

  test('#memory storage.getByKey no match', () => {
    expect.assertions(1);
    return storage.getByKey('memTest', { value: 999 })
      .then((result) => {
        expect(result).toHaveLength(0);
      })
      .catch((err) => { throw err; });
  });

  test('#memory storage.delete good request', () => {
    expect.assertions(2);
    return storage.delete('memTest', 456)
      .then((result) => {
        expect(result).toEqual('Success');
        expect(storage._mem.memTest[456]).toBeUndefined();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#memory storage.delete bad request', () => {
    expect.assertions(1);
    return storage.delete('memTest', 456)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message).toEqual('Schema memTest and/or ID 456 not found');
      });
  });

  test('#memory storage.upate good ID', () => {
    expect.assertions(1);
    return storage.update('memTest', { _id: 123, value: 'a new string' })
      .then((result) => {
        expect(result.value).toEqual('a new string');
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#memory storage.update good ID continued...', () => {
    expect.assertions(1);
    return storage.get('memTest', 123)
      .then((result) => {
        expect(result.value).toEqual('a new string');
      })
      .catch((err) => {
        throw err;
      });
  });
});
