'use strict';

const fs = require('fs');

const storage = require('../lib/storage/file-system');

const syncDataRead = (schema, item) => {
  const fd = storage.itemFd(schema, item);
  return JSON.parse(fs.readFileSync(fd).toString());
};


describe('File System storage module tests', () => {
  test('#storage.save', () => {
    storage.save('test', { _id: 123, value: 'a string' })
      .then(() => {
        const fd = storage.itemFd('test', { _id: 123 });
        expect(fs.existsSync(fd)).toBeTruthy();
        const buf = JSON.parse(fs.readFileSync(fd));
        expect(buf._id).toEqual(123);
        expect(buf.value).toEqual('a string');
      })
      .catch((err) => {
        throw err;
      });
  });
  

  test('#storage.get good id', (done) => {
    storage.get('test', 123)
      .then((result) => {
        expect(result._id).toEqual(123);
        expect(result.value).toEqual('a string');
        const buf = syncDataRead('test', { _id: 123 });
        expect(buf._id).toEqual(123);
        expect(buf.value).toEqual('a string');
        done();
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
        expect(result.message.includes('999.json not found')).toBeTruthy();
      });
  });

  test('#storage.getAll good schema', () => {
    storage.save('test', { _id: 456, value: 'a string' })
      .then(() => {
        storage.getAll('test')
          .then((result2) => {
            expect(result2).toHaveLength(2);
            expect(result2[0].value).toEqual('a string');
            expect(result2[0]._id).toEqual(123);
            expect(result2[1].value).toEqual('a string');
            expect(result2[1]._id).toEqual(456);
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
        expect(result.message.includes('/bad/ doesn\'t exist')).toBeTruthy();
      });
  });

  test('#storage.getByKey success', (done) => {
    storage.getByKey('test', { value: 'a string' })
      .then((result) => {
        expect(result).toHaveLength(2);
        expect(result[0]._id).toEqual(123);
        expect(result[0].value).toEqual('a string');
        done();
      })
      .catch((err) => { throw err; });
  });

  test('#storage.getByKey bad schema', () => {
    storage.getByKey('bad', { value: 999 })
      .then((err) => { throw err; })
      .catch((result) => {
        expect(result.message.includes('/bad/ doesn\'t exist')).toBeTruthy();
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
        expect(result).toEqual('Success');
        expect(fs.existsSync(storage.itemFd('test', { _id: 456 }))).toBeFalsy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('#storage.delete bad schema', () => {
    storage.delete('notaschema', 999)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message.includes('/notaschema/ doesn\'t exist')).toBeTruthy();
      });
  });

  test('#storage.delete bad request', () => {
    storage.delete('test', 333)
      .then((err) => {
        throw err;
      })
      .catch((result) => {
        expect(result.message.includes('/test/333.json doesn\'t exist')).toBeTruthy();
      });
  });

  test('#storage.upate good ID', () => {
    storage.update('test', { _id: 123, value: 'a new string' })
      .then((result) => {
        expect(result.value).toEqual('a new string');
        const result2 = syncDataRead('test', { _id: 123 });
        expect(result2.value).toEqual('a new string');
      })
      .catch((err) => {
        throw err;
      });
  });

  // test('#storage.update bad ID', () => {
  //   storage.update('test', { _id: 5555 })
  //     .then((err) => {
  //       throw err;
  //     })
  //     .catch((result) => {
  //       console.log('stor.up bad ID', result.message);
  //       expect(result.message.includes('5555.json. File doesn')).toBeTruthy();
  //     })
  //     .catch((err) => {
  //       throw err;
  //     });
  // });

  // test('#storage.update bad schema', () => {
  //   storage.update('nope', 123)
  //     .then((err) => {
  //       throw err;
  //     })
  //     .catch((result) => {
  //       console.log('stor upd bad sch', result.message);
  //       expect(result.message.includes('nope/ doesn')).toBeTruthy();
  //     })
  //     .catch((err) => {
  //       throw err;
  //     });
  // });
});
