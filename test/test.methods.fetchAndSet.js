const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('methods.fetchAndSet', (t) => {
  const urlPath = '/url';
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
          reply(null, { success: true });
        }
      });
      server.store = {
        set(key, value) {
          t.equal(key, 'key', 'sets key correctly');
          t.equal(value.success, true, 'sets value with result of HTTP GET');
        }
      };
      server.methods.fetchAndSet(urlPath, 'key', done);
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
