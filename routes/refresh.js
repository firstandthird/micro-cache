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
        urls: joi.array().items(joi.string())
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
    // refresh each url:
    async.each(request.payload.urls, (url, eachDone) => {
      server.methods.getKeys(url, (err, urlList) => {
        if (err) {
          server.log(err);
        }
        urlList.forEach((retrievedKey) => {
          const prefix = server.settings.app.redis.prefix;
          const urlToCall = retrievedKey.replace(`${prefix}-`, '');
          server.log(['micro-cache'], { message: 'refreshing key', key: retrievedKey, url: urlToCall });
          server.methods.fetchAndSet(urlToCall, retrievedKey, (fetchErr, result) => {
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
