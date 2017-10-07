const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');

let server;
tap.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

tap.test('store plugin calls redis server', (t) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({ env: 'test' });
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      return done(null, server);
    },
    verify(setup, done) {
      t.equal(typeof server.set, 'function', 'store.set is registered');
      t.equal(typeof server.get, 'function', 'store.get is registered');
      server.set('key', 'value');
      server.get('key', (err, result) => {
        t.equal(err, null, 'does not error on fetch');
        t.equal(result, 'value', 'can set/get values from store');
        t.end();
      });
    }
  });
});
