const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('route.proxy handles cache hit', (t) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({});
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.settings.app.redis.prefix = 'prefix';
      server.settings.app.origin = 'http://localhost:3000';
      return done(null, server);
    },
    testServer(setup, done) {
      const testServer = new Hapi.Server();
      testServer.connection({ port: 3000 });
      testServer.start(() => {
        done(null, testServer);
      });
    },
    get(setup, testServer, done) {
      server.store = {
        get: (key, callback) => {
          t.equal(key, 'prefix-{"path":"/whatever","headers":{}}', 'gets the correct cache key');
          return callback(null, 1234);
        }
      };
      server.inject({
        url: '/whatever'
      }, (response) => {
        done(null, response.result);
      });
    },
    verify(get, done) {
      t.equal(get, 1234, 'http GET works');
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});

tap.test('route.proxy handles cache miss', (t) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({});
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.settings.app.redis.prefix = 'prefix';
      server.settings.app.origin = 'http://localhost:3000';
      return done(null, server);
    },
    testServer(setup, done) {
      const testServer = new Hapi.Server();
      testServer.connection({ port: 3000 });
      testServer.start(() => {
        done(null, testServer);
      });
    },
    get(setup, testServer, done) {
      server.methods.fetchAndSet = function(obj, key, callback) {
        t.equal(obj.path, '/whatever', 'fetchAndSet gets correct path');
        t.equal(key, 'prefix-{"path":"/whatever","headers":{}}', 'fetchAndSet gets correct cache key');
        return callback(null, 'origin');
      };
      server.store = {
        set(key, value) {
          t.equal(key, 'prefix-{"path":"/whatever","headers":{}}', 'fetchAndSet gets correct cache key');
          t.equal(value, 'origin', 'fetchAndSet gets correct cache value');
        },
        get(key, callback) {
          t.equal(key, 'prefix-{"path":"/whatever","headers":{}}', 'gets the correct cache key');
          return callback();
        }
      };
      server.inject({
        url: '/whatever'
      }, (response) => {
        done(null, response.result);
      });
    },
    verify(get, done) {
      t.equal(get, 'origin', 'http GET works');
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});

tap.test('route.proxy handles cache miss with HEADERS', (t) => {
  process.env.HEADERS = 'x-api-key,X-Csrf-Token';
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({});
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.settings.app.redis.prefix = 'prefix';
      server.settings.app.origin = 'http://localhost:3000';
      return done(null, server);
    },
    testServer(setup, done) {
      const testServer = new Hapi.Server();
      testServer.connection({ port: 3000 });
      testServer.start(() => {
        done(null, testServer);
      });
    },
    get(setup, testServer, done) {
      server.methods.fetchAndSet = function(obj1, key, callback) {
        t.equal(obj1.path, '/whatever', 'fetchAndSet gets correct path');
        t.equal(key.startsWith('prefix-'), true, 'appends prefix to start of key');
        const obj = JSON.parse(key.replace('prefix-', ''));
        t.equal(obj.path, '/whatever', 'cache key contains url');
        t.equal(obj.headers['x-api-key'], 1234, ' cache key contains requested header fields');
        t.equal(obj.headers['x-csrf-token'], '54321', ' cache key contains requested header fields');
        return callback(null, 'origin');
      };
      server.store = {
        set(key, value) {
          t.equal(key.startsWith('prefix-'), true, 'appends prefix to start of key');
          const obj = JSON.parse(key.replace('prefix-', ''));
          t.equal(obj.path, '/whatever', 'cache key contains url');
          t.equal(obj.headers['x-api-key'], 1234, ' cache key contains requested header fields');
          t.equal(obj.headers['x-csrf-token'], '54321', ' cache key contains requested header fields');
          t.equal(value, 'origin', 'fetchAndSet gets correct cache value');
        },
        get(key, callback) {
          t.equal(key.startsWith('prefix-'), true, 'appends prefix to start of key');
          const obj = JSON.parse(key.replace('prefix-', ''));
          t.equal(obj.path, '/whatever', 'cache key contains url');
          t.equal(obj.headers['x-api-key'], 1234, ' cache key contains requested header fields');
          t.equal(obj.headers['x-csrf-token'], '54321', ' cache key contains requested header fields');
          return callback();
        }
      };
      server.inject({
        url: '/whatever',
        headers: {
          'x-api-key': 1234,
          'x-csrf-token': '54321'
        },
      }, (response) => {
        done(null, response.result);
      });
    },
    verify(get, done) {
      t.equal(get, 'origin', 'http GET works');
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});

tap.test('route.proxy handles cache hit with HEADERS', (t) => {
  process.env.HEADERS = 'x-api-key,X-Csrf-Token';
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({});
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.settings.app.redis.prefix = 'prefix';
      server.settings.app.origin = 'http://localhost:3000';
      return done(null, server);
    },
    testServer(setup, done) {
      const testServer = new Hapi.Server();
      testServer.connection({ port: 3000 });
      testServer.start(() => {
        done(null, testServer);
      });
    },
    get(setup, testServer, done) {
      server.store = {
        get: (key, callback) => {
          t.equal(key.startsWith('prefix-'), true, 'appends prefix to start of key');
          const obj = JSON.parse(key.replace('prefix-', ''));
          t.equal(obj.path, '/whatever', 'cache key contains url');
          t.equal(obj.headers['x-api-key'], 1234, ' cache key contains requested header fields');
          t.equal(obj.headers['x-csrf-token'], '54321', ' cache key contains requested header fields');
          return callback(null, 1234);
        }
      };
      server.inject({
        url: '/whatever',
        headers: {
          'x-api-key': 1234,
          'x-csrf-token': '54321'
        },
      }, (response) => {
        done(null, response.result);
      });
    },
    verify(get, done) {
      t.equal(get, 1234, 'http GET works');
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});
