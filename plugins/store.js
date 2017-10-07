const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  if (settings.redis.host) {
    cache = new Redis(settings.redis);
  }
  server.decorate('server', 'get', cache.get);
  server.decorate('server', 'set', cache.set);
  next();
};

exports.register.attributes = {
  name: 'store'
};
