const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');

let server;
tap.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

tap.test('methods.fetch', (t) => {
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
          console.log('called')
          reply(null, {});
        }
      });
      server.methods.fetchAndSet(urlPath, 'key', done);
    },
    retrieve(get, done) {
      console.log('get')
      return done(null, server.get('key'));
    },
    verify(get, retrieve, done) {
      t.equal(get, retrieve, 'stores the same object it got back');
      done();
    },
  }, (err, result) => {
    t.equal(err, null);
    result.testServer.stop(t.end);
  });
});
