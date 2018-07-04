'use strict';

// const logger = require('./logger');
const fs = require('fs');

const storage = module.exports = {};

// NOTE: I'm putting my data/ in the project root folder
storage.dataFd = `${__dirname}/../../../data`; 
storage.itemFd = (schema, item) => `${storage.dataFd}/${schema}/${item._id}.json`;

// this module implements an object-agnostic library for
// storing arbitrary items in multiple schemas. 
// 
// memory will look like this:
// memory = {
//   'schema': {
//     'item's uuid: {
//       key: value pairs of item object
//     }
//   }
// }
//
// exported methods include:
//    save(schema, item) save object item in schema
//    get(schema, ID) get item with ID from schema
//    getAll(schema) return array of all items in schema
//    getByKey(schema, searchObj) return array of all
//      items in schema matching object searchObj's key:
//      value
//    delete(schema, ID) delete item with ID from schema
//    update(schema, item) update schema item whos ID 
//      matches that provided in the parameter object
//    
// schema is a string identifying the resource type. 
// the memmory object can support multiple different
// schemas simultaneously.  In this case (Lab-08) it
// will only be used to hold 'Books'.
// item is an object that at minimum includes an _id
// property that is unique among all the items within
// the schema.
//
// All functions return promises for resolution and rejection.

storage.save = (schema, item) => {
  return new Promise((resolve, reject) => {
    if (!schema) return reject(new Error('Cannot create a new item: schema name required.'));

    if (!item) return reject(new Error('Cannot create a new item: item object missing.'));

    // if data directory doesn't exist, create it
    if (!fs.existsSync(`${storage.dataFd}/`)) fs.mkdirSync(storage.dataFd);
  
    // if data/schema directory doesn't exist, create it
    const schemaFd = `${storage.dataFd}/${schema}/`;
    if (!fs.existsSync(schemaFd)) fs.mkdirSync(schemaFd);

    // write item to data/schema/item._id.json file
    const itemFile = storage.itemFd(schema, item);
    let buf;
    try {
      buf = JSON.stringify(item);
    } catch (err) {
      return reject(err);
    }
    fs.writeFile(itemFile, buf, (err) => {
      if (err) return reject(err);
      return resolve(item);
    });
  
    return undefined;
  });
};

storage.get = (schema, _id) => {
  return new Promise((resolve, reject) => {
    const fd = storage.itemFd(schema, { _id });

    if (!fs.existsSync(fd)) {
      return reject(new Error(`${fd} not found`));
    }

    fs.readFile(fd, (err, data) => {
      if (err) return reject(err);
      let buf = data.toString();
      try {
        buf = JSON.parse(buf);
      } catch (err2) {
        return reject(err2);
      }
      return resolve(buf);
    });

    return undefined;
  });
};

storage.getAll = (schema) => {
  return new Promise((resolve, reject) => {
    const schemaDir = `${storage.dataFd}/${schema}/`;
    if (!fs.existsSync(schemaDir)) return reject(new Error(`${schemaDir} doesn't exist`));

    // readdir returns an array of files in the given directory
    fs.readdir(schemaDir, (err, dirs) => {
      if (err) reject(err);

      if (dirs.length === 0) resolve([]);
      const promiseList = [];
      for (let d = 0; d < dirs.length; d += 1) {
        const promise = new Promise((resolveD, rejectD) => {
          const fd = `${storage.dataFd}/${schema}/${dirs[d]}`;
          fs.readFile(fd, (errD, data) => {
            if (errD) return rejectD(errD);
            let parsedData;
            try {
              parsedData = JSON.parse(data);
            } catch (err2) {
              return reject(err2);
            }
            resolveD(parsedData);
            return undefined;
          });
        });
        promiseList.push(promise);
      }

      Promise.all(promiseList).then((allData) => {
        resolve(allData);
      });
    });
    return undefined;
  });
};

storage.getByKey = (schema, searchFor) => {
  // get ALL THE DATA into an array of objects
  return new Promise((resolve, reject) => {
    storage.getAll(schema)
      .then((data) => {
        const searchKey = Object.keys(searchFor)[0];
        const searchVal = searchFor[searchKey];
        // create match array with schema items matching
        // the searchFor object's key: value
        const match = [];
        data.forEach((item) => {
          if (item[searchKey] === searchVal) {
            match.push(item);
          }
        });
        resolve(match);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

storage.delete = (schema, _id) => {
  return new Promise((resolve, reject) => {
    const schemaDir = `${storage.dataFd}/${schema}/`;
    if (!fs.existsSync(schemaDir)) return reject(new Error(`${schemaDir} doesn't exist`));

    const delFd = storage.itemFd(schema, { _id });
    if (!fs.existsSync(delFd)) return reject(new Error(`${delFd} doesn't exist`));

    fs.unlink(delFd, (err) => {
      if (err) return reject(err);
      return resolve('Success');
    });
    // fs.unlinkSync(delFd);
    // return resolve('Success');
    return undefined;
  });
};

storage.update = (schema, item) => {
  const schemaDir = `${storage.dataFd}/${schema}/`;
  if (!fs.existsSync(schemaDir)) return Promise.reject(new Error(`${schemaDir} doesn't exist`));

  const updateFd = storage.itemFd(schema, { _id: item._id });
  if (!fs.existsSync(updateFd)) return Promise.reject(new Error(`Unable to update ${updateFd}. File doesn't exist`));

  return storage.save(schema, item);
};
