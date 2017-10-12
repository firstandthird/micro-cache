const Redis = require('ioredis');
const minimatch = require('minimatch');

exports.register = function(server, options, next) {
  const settings = server.settings.app;
  let cache = settings.cache || {};
  // use internal cache if no host given:
  if (!settings.redis.host) {
    server.decorate('server', 'store', {
      get: (key, done) => done(null, cache[key]),
      set: (key, value) => {
        cache[key] = value;
      },
      scan: (expression, done) => {
        const matches = Object.keys(cache).reduce((list, item) => {
          if (minimatch(item, expression)) {
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
    get: (key, done) => {
      cache.get.bind(cache)(key, (err, store) => {
        if (err) {
          return done(err);
        }
        // try to parse as json, return as string otherwise:
        try {
          const value = JSON.parse(store);
          return done(null, value);
        } catch (e) {
          return done(null, store.toString());
        }
      });
    },
    set: (key, value) => {
      const store = typeof value === 'object' ? JSON.stringify(value) : value.toString();
      cache.set.bind(cache)(key, store);
    },
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
