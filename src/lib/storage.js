'use strict';

const logger = require('./logger');

const storage = module.exports = {};

const memory = {};

// memory will look like this:
// memory = {
//   'schema': {
//     'item's uuid: {
//       key: value pairs of item object
//     }
//   }
// }


// schema is a string identifying the resource type. 
// the memmory object can support multiple different
// schemas simultaneously.  In this case (Lab-08) it
// will only hold 'Books'.
// item is an object that at minimum includes a _id
// property that is unique among all the schema items.
storage.save = (schema, item) => {
  return new Promise((resolve, reject) => {
    if (!schema) return reject(new Error('Cannot create a new item: schema name required.'));
    if (!item) return reject(new Error('Cannot create a new item: item object missing.'));

    if (!memory[schema]) memory[schema] = {};
    memory[schema][item._id] = item;
    logger.log(logger.INFO, `STORAGE.save: Created a new resource ${JSON.stringify(memory[schema][item._id], null, 2)}`);
    return resolve(item);
  });
};


// This uses a straight "Promise.resolve"
// When you do this, you don't have to do the whole promise wiring.
// Rather, JS just returns a promise and immediately resolves/rejects it for you

storage.get = (schema, _id) => {
  if (memory[schema][_id]) {
    logger.log(logger.INFO, `STORAGE: fetching ${JSON.stringify(memory[schema][_id], null, 2)}\nfrom ${schema}.`);
    return Promise.resolve(memory[schema][_id]);
  }
  return Promise.reject(new Error(`${_id} not found`));
};

storage.getAll = (schema) => {
  if (memory[schema]) {
    logger.log(logger.INFO, `STORAGE: fetching all items from ${schema}`);
    return Promise.resolve(memory[schema]);
  }
  return Promise.resolve(null);
};

storage.getByKey = (schema, searchFor) => {
  if (memory[schema]) {
    // debugger;
    const searchKey = Object.keys(searchFor)[0];
    const searchVal = searchFor.searchKey;
    const searchSchema = memory[schema];
    const schemaKeyVals = Object.keys(searchSchema); // array of _id's
    const mappedSchema = schemaKeyVals
      .map((key) => { 
        return { _id: searchSchema[key]._id, k: searchSchema[key][searchKey] };
      });
    const keyID = mappedSchema.filter(o => o.k === searchVal);
    return Promise.resolve(memory[schema][keyID]);
  }
  return Promise.resolve(null);
};

storage.delete = (schema, _id) => {
  if (memory[schema][_id]) {
    logger.log(logger.INFO, `STORAGE: deleting _id ${_id} from ${schema}.`);
    delete memory[schema][_id];
    return Promise.resolve(memory[schema][_id]);
  }
  return Promise.reject(new Error(`${_id} not found`));
};
