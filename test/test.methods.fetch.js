const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');
const Hapi = require('hapi');
// concat origin (from settings) and path and then make that request using wreck

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
    get(setup, done) {
      testServer.route({
        method: 'get',
        path: '/url',
        handler(request, reply) {
          console.log('called')
          reply(null, {});
        }
      });
      server.methods.fetch('get', urlPath, done);
    },
    post(setup, done) {
      testServer.route({
        method: 'post',
        path: '/url',
        handler(request, reply) {
          console.log('called')
          reply(null, {});
        }
      });
      server.methods.fetch('post', urlPath, done);
    },
    put(setup, done) {
      testServer.route({
        method: 'put',
        path: '/url',
        handler(request, reply) {
          console.log('called')
          reply(null, {});
        }
      });
      server.methods.fetch('put', urlPath, done);
    },
    httpDelete(setup, done) {
      testServer.route({
        method: 'delete',
        path: '/url',
        handler(request, reply) {
          console.log('called')
          reply(null, {});
        }
      });
      server.methods.fetch('delete', urlPath, done);
    },
    verify(get, post, put, httpDelete, done) {
      console.log(get)
      console.log(post)
      done();
    },
  }, (err, result) => {
    t.equal(err, null);
    result.testServer.stop(t.end);
  });
});
