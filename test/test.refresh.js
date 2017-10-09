const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;

tap.test('routes.refresh', (t) => {
  const keysSeen = [];
  const pathsSeen = [];
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
    get(setup, testServer, done) {
      server.methods.getKeys = (url, callback) => {
        callback(null, ['key1', 'key2']);
      };
      server.methods.fetchAndSet = (path, key, callback) => {
        keysSeen.push(key);
        pathsSeen.push(path);
        callback();
      };
      server.inject({
        method: 'POST',
        url: '/_refresh',
        payload: {
          secret: 'secret',
          urls: ['/url']
        },
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns 200 OK');
        done();
      });
    },
    wait(get, done) {
      setTimeout(done, 2000);
    },
    verify(wait, get, done) {
      t.equal(keysSeen.length, 2, 'fetches/sets all keys');
      t.equal(pathsSeen.length, 2, 'fetches/sets all paths');
      t.equal(keysSeen[0], 'prefix-key1', 'sets the key correctly');
      t.equal(keysSeen[1], 'prefix-key2', 'sets the key correctly');
      t.equal(pathsSeen[0], 'key1', 'sets the value correctly');
      t.equal(pathsSeen[1], 'key2', 'sets the value correctly');
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
