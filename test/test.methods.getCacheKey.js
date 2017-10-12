const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

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
        url: { path: '/blah' },
        headers: { 'x-api-key': 1234, 'x-csrf-token': 'token' }
      });
      t.equal(key1A, 'prefix-{"path":"/blah","headers":{"x-api-key":1234,"x-csrf-token":"token"}}');
      done();
    }
  }, () => {
    server.stop(() => {
      t.end();
    });
  });
});
