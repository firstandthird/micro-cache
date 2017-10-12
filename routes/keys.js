const joi = require('joi');
const boom = require('boom');

module.exports.refresh = {
  method: 'GET',
  path: '/_keys',
  config: {
    validate: {
      query: {
        secret: joi.string()
      }
    }
  },
  handler(request, reply) {
    const server = request.server;
    if (request.query.secret !== server.settings.app.secret) {
      return reply(boom.unauthorized);
    }

    const prefix = server.settings.app.redis.prefix;
    server.store.scan(`${prefix}-*`, reply);
  }
};
