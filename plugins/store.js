const Redis = require('ioredis');

exports.register = function(server, options, next) {
  let cache = server.settings.app.cache;
  if (server.settings.app.redis.host) {
    cache = new Redis(server.settings.app.redis);
  }
  server.decorate('server', 'get', cache.get);
  server.decorate('server', 'set', cache.set);
};

exports.register.attributes = {
  name: 'store'
};
