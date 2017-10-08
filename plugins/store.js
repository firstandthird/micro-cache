const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  // use internal cache if no host given:
  if (!settings.redis.host) {
    server.decorate('server', 'store', {
      get: cache.get,
      set: (key, value) => cache.set(key, value, null, (err) => {
        server.log(err);
      }),
      scan: (expression, done) => {
        // todo: how to get keys from catbox?
        done();
      },
      flush: () => {
        cache = server.cache({ expiresIn: 60 * 60 * 1000 });
      }
    });
    return next();
  }
  cache = new Redis(settings.redis);
  function scan(expression, done) {
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

  server.decorate('server', 'store', {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    scan: scan.bind(cache),
    flush: cache.flushall.bind(cache) // used for unit tests
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
