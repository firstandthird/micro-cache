const Redis = require('ioredis');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache;
  // use internal cache if no host given:
  if (!settings.redis.host) {
    server.decorate('server', 'store', {
      get: (key, done) => done(null, cache[key]),
      set: (key, value, done) => {
        cache[key] = value;
        if (typeof done === 'function') {
          return done();
        }
      },
      scan: (expression, done) => {
        const compareFixed = (key, item) => item === key;
        const compareWild = (key, item) => item.startsWith(key.replace('*', ''));
        const compare = expression.endsWith('*') ? compareWild : compareFixed;
        const matches = Object.keys(cache).reduce((list, item) => {
          if (compare(expression, item)) {
            list.push(item);
          }
          return list;
        }, []);
        done(null, matches);
      },
      flush() { cache = {}; }
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
