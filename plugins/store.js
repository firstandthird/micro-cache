const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  if (settings.redis.host) {
    cache = new Redis(settings.redis);
  }
  // get a key from cache:
  server.decorate('server', 'get', cache.get);
  // set a key:value pair in cache:
  server.decorate('server', 'set', cache.set);
  // get a list of keys that pattern-match the url:
  server.decorate('server', 'scan', (url, done) => {
    const stream = cache.scanStream({ match: url });
    const keys = [];
    stream.on('data', (resultKeys) => {
      // `resultKeys` is an array of strings representing key names
      for (let i = 0; i < resultKeys.length; i++) {
        keys.push(resultKeys[i]);
      }
    });
    stream.on('error', (err) => done(err));
    stream.on('end', () => done(null, keys));
  });
  next();
};

exports.register.attributes = {
  name: 'store'
};
