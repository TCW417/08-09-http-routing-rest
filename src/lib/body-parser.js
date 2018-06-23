const url = require('url');
// const queryString = require('querystring');


module.exports = (request) => {
  return new Promise((resolve, reject) => {
    if (!request || !request.url) return reject(new Error('Invalid Request Object. Cannot parse.'));

    request.url = url.parse(request.url, true);
    console.log('>>>>>>>>BP request.url', request.url);
    console.log('>>>>>>>>BP request.method', request.method);
    if (!request.method.match(/POST|PUT|PATCH/)) {
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
