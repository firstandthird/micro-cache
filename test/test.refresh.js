const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('routes.refresh', (t) => {
  process.env.CACHE_SECRET = 'secret';
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
    testServer(setup, done) {
      const testServer = new Hapi.Server();
      testServer.connection({ port: 3000 });
      testServer.start(() => {
        done(null, testServer);
      });
    },
    flush(testServer, done) {
      server.store.flush();
      let count = 0;
      testServer.route({
        method: 'get',
        path: '/{key}',
        handler(request, reply) {
          count++;
          return reply(null, count);
        }
      });
      done();
    },
    inject(flush, setup, testServer, done) {
      const prefix = server.settings.app.redis.prefix;
      server.store.set(`${prefix}-/key1`, 'value1');
      server.store.set(`${prefix}-/key2`, 'value2');
      server.store.set(`${prefix}-/doesNotMatch`, 'value1');
      server.inject({
        method: 'POST',
        url: '/_refresh',
        payload: {
          secret: 'secret',
          urls: ['/key*']
        },
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns 200 OK');
        done();
      });
    },
    wait(inject, done) {
      setTimeout(done, 2000);
    },
    get1(wait, done) {
      const prefix = server.settings.app.redis.prefix;
      server.store.get(`${prefix}-/key1`, done);
    },
    get2(wait, done) {
      const prefix = server.settings.app.redis.prefix;
      server.store.get(`${prefix}-/key2`, done);
    },
    get3(wait, done) {
      const prefix = server.settings.app.redis.prefix;
      server.store.get(`${prefix}-/doesNotMatch`, done);
    },
    verify(wait, inject, get1, get2, get3, done) {
      t.equal(get1, 1, 'updates matching cached value');
      t.equal(get2, 2, 'updates matching cached value');
      t.equal(get3, 'value1', 'does not update non-matching cached value');
      done();
    },
  }, (err, result) => {
    t.equal(!err, true, 'does not error');
    server.stop(() => {
      result.testServer.stop(() => {
        t.end();
      });
    });
  });
});
