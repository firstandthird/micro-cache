const joi = require('joi');
const boom = require('boom');
const async = require('async');

module.exports.refresh = {
  method: 'POST',
  path: '/_refresh',
  config: {
    validate: {
      payload: {
        secret: joi.string(),
        keys: joi.array().items(joi.string())
      }
    }
  },
  handler(request, reply) {
    const server = request.server;
    if (request.payload.secret !== server.settings.app.secret) {
      return reply(boom.unauthorized);
    }
    // reply without delay:
    reply(null, { accepted: true });
    // refresh each url, add the prefix to make sure keys match:
    const prefix = server.settings.app.redis.prefix;
    async.each(request.payload.keys, (key, eachDone) => {
      server.methods.getKeys(`${prefix}*${key}`, (err, urlList) => {
        if (err) {
          server.log(err);
        }
        urlList.forEach((retrievedKey) => {
          const obj = JSON.parse(retrievedKey.replace(`${prefix}-`, ''));
          server.log(['micro-cache'], { message: 'refreshing key', key: retrievedKey, url: obj.path, headers: obj.headers });
          server.methods.fetchAndSet(obj, retrievedKey, (fetchErr, result) => {
            if (fetchErr) {
              server.log(fetchErr);
            }
          });
        });
        eachDone();
      });
    });
  }
};
