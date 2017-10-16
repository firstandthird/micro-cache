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
        // try to parse as json:
        try {
          const obj = JSON.parse(store);
          return done(null, obj.value);
        } catch (e) {
          return done(e);
        }
      });
    },
    set: (key, value) => {
      cache.set.bind(cache)(key, JSON.stringify({ value }));
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
