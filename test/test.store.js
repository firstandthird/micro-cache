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
      t.equal(typeof server.store.set, 'function', 'store.set is registered');
      t.equal(typeof server.store.get, 'function', 'store.get is registered');
      server.store.set('key', 'value');
      server.store.get('key', (err, result) => {
        t.equal(err, null, 'does not error on fetch');
        t.equal(result, 'value', 'can set/get values from store');
      });
    }
  }, (err) => {
    t.equal(err, null);
    server.stop(() => {
      t.end();
    });
  });
});

tap.test('store plugin can scan for matching keys', (t) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({ env: 'test' });
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      return done(null, server);
    },
    scan1(setup, done) {
      t.equal(typeof server.scan, 'function', 'store.scan is registered');
      server.methods.getKeys('key', done);
    },
    verify1(scan1, done) {
      t.equal(scan1.length, 1);
      done();
    },
    scan2(setup, done) {
      server.set('key1', 'value1');
      server.set('key2', 'value2');
      server.set('key3', 'value3');
      server.methods.getKeys('key*', done);
    },
    verify2(scan2, done) {
      t.equal(scan2.length, 1);
      done();
    }
  }, (err) => {
    t.equal(err, null);
    server.stop(() => {
      t.end();
    });
  });
});
