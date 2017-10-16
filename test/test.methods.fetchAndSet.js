const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('methods.fetchAndSet', (t) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({ env: 'test' });
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
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
    get(testServer, setup, done) {
      testServer.route({
        method: 'get',
        path: '/url',
        handler(request, reply) {
          t.equal(request.headers.header1, '1234', 'passes headers along');
          reply(null, { success: true });
        }
      });
      server.store = {
        set(key, value) {
          t.equal(key, 'key', 'sets key correctly');
          t.equal(value.success, true, 'sets value with result of HTTP GET');
        }
      };
      server.methods.fetchAndSet({ path: '/url', headers: { header1: 1234 } }, 'key', done);
    },
  }, (err, result) => {
    t.equal(err, null);
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});

tap.test('methods.fetchAndSet', (t) => {
  async.autoInject({
    rapptor(done) {
      // set ttl to 1 second:
      process.env.TTL = 1;
      const rapptor = new Rapptor({ env: 'test' });
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
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
    set(testServer, setup, done) {
      testServer.route({
        method: 'get',
        path: '/url',
        handler(request, reply) {
          t.equal(request.headers.header1, '1234', 'passes headers along');
          reply(null, { success: true });
        }
      });
      server.methods.fetchAndSet({ path: '/url', headers: { header1: 1234 } }, 'key', done);
    },
    get1(set, done) {
      server.store.get('key', done);
    },
    wait(get1, done) {
      setTimeout(done, 5000);
    },
    get2(wait, done) {
      server.store.get('key', done);
    },
    verify(get1, get2, done) {
      t.equal(get1.success, true, 'cache value was set initially');
      t.equal(get2, null, 'expiring cache value expires');
      done();
    }
  }, (err, result) => {
    t.equal(err, null);
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});
