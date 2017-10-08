const joi = require('joi');
const boom = require('boom');
const async = require('async');

module.exports.refresh = {
  method: 'POST',
  url: '/_refresh',
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
    reply(null, { accepted: true });
    async.each(request.payload.urls, (url, eachDone) => {
      server.methods.getKeys(url, (err, urlList) => {
        if (err) {
          server.log(err);
        }
        urlList.forEach((path) => {
          const key = server.methods.getCacheKey(path);
          server.methods.fetchAndSet(path, key, (fetchErr, result) => {
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
