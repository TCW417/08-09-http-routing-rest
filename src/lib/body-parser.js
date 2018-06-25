const url = require('url');
// const queryString = require('querystring');

const makeBodyObj = (inputStr) => {
  // const part1 = inputStr.replace(/(*.)=(*.)/g, '"$1":"$2",');
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
    console.log('>>>>>>>>BP request.url', request.url.pathname);
    console.log('>>>>>>>>BP request.method', request.method);

    if (!request.method.match(/POST|PUT|PATCH/)) {
      return resolve(request);
    }

    let message = '';
    const indexOfSpace = request.url.pathname.indexOf('%20');
    console.log('>>>>>>>>>>BP indexOf %20', indexOfSpace);
    if (indexOfSpace > 0) {
      const decodedURI = decodeURI(request.url.pathname);
      console.log('>>>>>>>>>>>> decodedURI', decodedURI);
      request.url.pathname = decodedURI.slice(0, indexOfSpace);
      console.log('>>>>>>>>>>> request.url.pathname', request.url.pathname);
      console.log('>>>>>>>>>>>> will send to makeJSON', decodedURI.slice(indexOfSpace + 1).trim());
      request.body = makeBodyObj(decodedURI.slice(indexOfSpace + 1));
      console.log('>>>>>>>>>>request.body', request.body);
      return resolve(request);
    } 

    request.on('data', (data) => {
      message += data.toString();
    });
        
    request.on('end', () => {
      // this takes the JSON message and turns it into a JS object, 
      // and attaches it as the "body" propery on the bigger request object
      // possible errors: passing in ' ', usually results in a SyntaxError
      try {
        request.body = JSON.parse(message);
        console.log('>>>>>>>>>>BP message', message);
        console.log('>>>>>>>>>>BP request.body', request.body);
        return resolve(request);
      } catch (err) {
        return reject(err);
      }
    });

    request.on('error', reject);
    return undefined;
  });
};

