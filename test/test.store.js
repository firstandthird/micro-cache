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
      server.store.flush();
      return done(null, server);
    },
    verify(setup, done) {
      t.equal(typeof server.store.set, 'function', 'store.set is registered');
      t.equal(typeof server.store.get, 'function', 'store.get is registered');
      server.store.set('key', 'value');
      server.store.get('key', (err, result) => {
        t.equal(err, null, 'does not error on fetch');
        t.equal(result, 'value', 'can set/get values from store');
        done();
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
      server.store.flush();
      return done(null, server);
    },
    scan1(setup, done) {
      t.equal(typeof server.store.scan, 'function', 'store.scan is registered');
      server.methods.getKeys('key', done);
    },
    verify1(scan1, done) {
      t.equal(scan1.length, 1, 'if no wildcard, scan only returns exact matching key');
      t.equal(scan1[0], 'key', 'if no wildcard, scan only returns exact matching key');
      done();
    },
    scan2(setup, done) {
      server.store.set('key1', 'value1');
      server.store.set('key2', 'value2');
      server.store.set('key3', 'value3');
      server.methods.getKeys('key*', done);
    },
    verify2(scan2, done) {
      t.equal(scan2.length, 3);
      t.notEqual(scan2.indexOf('key1'), -1, 'returns list including key1');
      t.notEqual(scan2.indexOf('key2'), -1, 'returns list including key2');
      t.notEqual(scan2.indexOf('key3'), -1, 'returns list including key3');
      done();
    }
  }, (err) => {
    t.equal(err, null);
    server.stop(() => {
      t.end();
    });
  });
});
