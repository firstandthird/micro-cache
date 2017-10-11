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
      const key1A = server.methods.getCacheKey('/blah?token=123&sort=name');
      const key1B = server.methods.getCacheKey('/blah?sort=name&token=123');
      const key1C = server.methods.getCacheKey('/blah?sort=name&token=124');
      const key2A = server.methods.getCacheKey('/blah1/blah2?sort=name&token=123&clock=1');
      const key2B = server.methods.getCacheKey('/blah1/blah2?token=123&sort=name&clock=1');
      t.equal(key1A, key1B);
      t.equal(key2A, key2B);
      t.notEqual(key1A, key1C);
      t.notEqual(key1A, key2A);
      done();
    }
  }, () => {
    server.stop(() => {
      t.end();
    });
  });
});
