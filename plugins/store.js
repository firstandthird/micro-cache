const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  if (settings.redis.host) {
    cache = new Redis(settings.redis);
  }
  server.decorate('server', 'store', {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache)
  });
  let running = true;
  // shut down the cache when server shuts down:
  server.on('stop', () => {
    if (running) {
      cache.quit.bind(cache)();
    }
    running = false;
  });
  next();
};

exports.register.attributes = {
  name: 'store'
};
