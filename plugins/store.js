const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  if (settings.redis.host) {
    cache = new Redis(settings.redis);
  }
  server.decorate('server', 'store', {
    get: cache.get,
    set: cache.set,
    scan(expression, done) {
      const stream = cache.scanStream({ match: expression });
      const keys = [];
      stream.on('data', (resultKeys) => {
        // `resultKeys` is an array of strings representing key names
        for (let i = 0; i < resultKeys.length; i++) {
          keys.push(resultKeys[i]);
        }
      });
      stream.on('error', (err) => done(err));
      stream.on('end', () => done(null, keys));
    }
  });
  next();
};

exports.register.attributes = {
  name: 'store'
};
