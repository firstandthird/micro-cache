const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('route.proxy handles cache hit', (t) => {
  const urlPath = '/url';
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
          t.equal(key, 'prefix-/whatever', 'gets the correct cache key');
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

tap.test('route.proxy handles cache hit', (t) => {
  const urlPath = '/url';
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
      testServer.route({
        method: 'get',
        path: '/whatever',
        handler(request, reply) {
          reply(null, 'origin');
        }
      });
      server.store = {
        get(key, callback) {
          t.equal(key, 'prefix-/whatever', 'gets the correct cache key');
          return callback();
        },
        set(key, value) {
          t.equal(key, 'prefix-/whatever', 'sets the correct cache key');
          t.equal(value, 'origin', 'sets the origin value');
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
