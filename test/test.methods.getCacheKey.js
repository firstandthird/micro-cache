const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('methods.getCacheKey', (t) => {
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
    cacheKey(setup, done) {
      const key1A = server.methods.getCacheKey({ url: { pathname: '/blah' }, query: { token: 123, sort: 'name' } });
      const key1B = server.methods.getCacheKey({ url: { pathname: '/blah' }, query: { sort: 'name', token: '123' } });
      const key1C = server.methods.getCacheKey({ url: { pathname: '/blah' }, query: { sort: 'name', token: '124' } });
      const key2A = server.methods.getCacheKey({ url: { pathname: '/blah1/blah2' }, query: { sort: 'name', token: '123', clock: 1 } });
      const key2B = server.methods.getCacheKey({ url: { pathname: '/blah1/blah2' }, query: { token: '123', sort: 'name', clock: 1 } });
      t.equal(key1A, key1B);
      t.equal(key2A, key2B);
      t.notEqual(key1A, key1C);
      t.notEqual(key1A, key2A);
      t.equal(key1A, 'prefix-/blah?sort=name&token=123');
      t.equal(key1C, 'prefix-/blah?sort=name&token=124');
      t.equal(key2A, 'prefix-/blah1/blah2?clock=1&sort=name&token=123');
      done();
    }
  }, () => {
    server.stop(() => {
      t.end();
    });
  });
});

tap.test('methods.getCacheKey can use HEADERS', (t) => {
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
    cacheKey(setup, done) {
      const key1A = server.methods.getCacheKey({
        connection: {
          info: {
            protocol: 'http'
          }
        },
        info: { host: 'localhost' },
        url: { path: '/blah' },
        headers: { 'x-api-key': 1234, 'x-csrf-token': 'token' }
      });
      t.equal(key1A, 'prefix-{"url":"http://localhost/blah","headers":{"x-api-key":1234,"x-csrf-token":"token"}}');
      done();
    }
  }, () => {
    server.stop(() => {
      t.end();
    });
  });
});
