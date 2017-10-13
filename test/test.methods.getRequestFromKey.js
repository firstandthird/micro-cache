const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('methods.fetch', (t) => {
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
    verify(setup, done) {
      const obj = { path: 'path', headers: { h1: 1234 } };
      const request = server.methods.getRequestFromKey(`prefix-${JSON.stringify(obj)}`);
      t.equal(obj.path, request.path);
      t.equal(obj.headers.h1, 1234);
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      t.end();
    });
  });
});
