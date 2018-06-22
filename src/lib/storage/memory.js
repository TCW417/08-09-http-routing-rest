'use strict';

// const logger = require('./logger');

const storage = module.exports = {};

const memory = storage._mem = {};

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

    if (!memory[schema]) memory[schema] = {};

    memory[schema][item._id] = item;

    return resolve(item);
  });
};

storage.get = (schema, _id) => {
  if (memory[schema][_id]) {
    return Promise.resolve(memory[schema][_id]);
  }
  return Promise.reject(new Error(`${_id} not found`));
};

storage.getAll = (schema) => {
  if (memory[schema]) {
    const keys = Object.keys(memory[schema]);
    const items = [];

    keys.forEach(key =>
      items.push(memory[schema][key]));

    return Promise.resolve(items);
  }
  return Promise.reject(new Error(`Schema ${schema} not found`));
};

storage.getByKey = (schema, searchFor) => {
  if (memory[schema]) {
    const searchKey = Object.keys(searchFor)[0];
    const searchVal = searchFor[searchKey];
    const searchSchema = memory[schema];
    // get array of all schema item keys
    const schemaKeyVals = Object.keys(searchSchema);
    // create match array with schema items matching
    // the searchFor object's key: value
    const match = [];
    schemaKeyVals.forEach((key) => {
      if (searchSchema[key][searchKey] === searchVal) {
        match.push(searchSchema[key]);
      }
    });
    return Promise.resolve(match);
  }
  return Promise.reject(new Error(`Schema ${schema} not found`));
};

storage.delete = (schema, _id) => {
  if (memory[schema][_id]) {
    delete memory[schema][_id];
    return Promise.resolve('Success');
  }
  return Promise.reject(new Error(`Schema ${schema} and/or ID ${_id} not found`));
};

storage.update = (schema, item) => {
  if (memory[schema][item._id]) {
    const tempId = item._id;

    Object.assign(memory[schema][tempId], item);

    return Promise.resolve(memory[schema][item._id]);
  }
  return Promise.reject(new Error(`Schema ${schema} and/or ID ${item._id} not found`));
};
