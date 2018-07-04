const url = require('url');
// const queryString = require('querystring');

const makeBodyObj = (inputStr) => {
  // as of 6/24/18 this function doesn't work. I need a real parser for key=value pairs
  // if this api server is to work with postman who sends PUT/POST bodies differently
  // than httpie.
  const obj = {};
  let st = 0;
  let eq = inputStr.indexOf('=');
  let sp = inputStr.indexOf(' ');
  while (eq > 0 && sp > 0) {
    const key = inputStr.slice(st, eq);
    const value = inputStr.slice(eq + 1, sp);
    obj[key] = value;
    st = sp + 1;
    eq = inputStr.indexOf('=', st);
    sp = inputStr.indexOf(' ', st);
  }
  return obj;
};

module.exports = (request) => {
  return new Promise((resolve, reject) => {
    if (!request || !request.url) return reject(new Error('Invalid Request Object. Cannot parse.'));

    request.url = url.parse(request.url, true); // true causes query to be parsed too.

    if (!request.method.match(/POST|PUT|PATCH/)) {
      return resolve(request);
    }

    // the code below was/is my attempt to get this to work with Postman. Postman handles
    // things differently than httpie which causes big problems.  GETs work fine, but PUTs and POSTs
    // with the key=values of the book tacked onto the URL like you do with httpie, or even plugged
    // into postmans body "builder" section, end up as encoded strings attached to the URL pathname.
    // for example:
    // http POST :3000/api/v1/books title='The New Title' author='Tracy Williams'
    // will result in result.url.pathname being /api/v1/books and message being filled with a JSON
    // string that JSON.parse can successfully make an object out of for request.body.
    // OTOH, using Postman to send the same thing to localhost:3000 results in a URL pathname of
    // /api/v1/books%20title=%27The%20New%20Title%27%20author=%27Tracy%20Williams%27
    // GET works fine with postman.
    const indexOfSpace = request.url.pathname.indexOf('%20');
    if (indexOfSpace > 0) {
      const decodedURI = decodeURI(request.url.pathname);
      request.url.pathname = decodedURI.slice(0, indexOfSpace);
      request.body = makeBodyObj(decodedURI.slice(indexOfSpace + 1));
      return resolve(request);
    } 
    
    let message = '';

    request.on('data', (data) => {
      message += data.toString();
    });
        
    request.on('end', () => {
      // this takes the JSON message and turns it into a JS object, 
      // and attaches it as the "body" propery on the bigger request object
      // possible errors: passing in ' ', usually results in a SyntaxError
      try {
        request.body = JSON.parse(message);
        return resolve(request);
      } catch (err) {
        return reject(err);
      }
    });

    request.on('error', reject);
    return undefined;
  });
};

