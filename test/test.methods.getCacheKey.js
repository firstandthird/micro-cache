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
        url: { pathname: '/blah' },
        query: { d: 2, a: 1 },
        headers: { 'x-api-key': 1234, 'x-csrf-token': 'token' }
      });
      t.equal(key1A, 'prefix-{"path":"/blah?a=1&d=2","headers":{"x-api-key":1234,"x-csrf-token":"token"}}');
      done();
    }
  }, () => {
    server.stop(() => {
      t.end();
    });
  });
});
