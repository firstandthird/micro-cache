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
      testServer.route({
        method: 'get',
        path: '/url',
        handler(request, reply) {
          reply(null, { success: true });
        }
      });
      server.methods.fetch('get', urlPath, done);
    },
    post(setup, testServer, done) {
      testServer.route({
        method: 'post',
        path: '/url',
        handler(request, reply) {
          reply(null, { success: true });
        }
      });
      server.methods.fetch('post', urlPath, done);
    },
    put(setup, testServer, done) {
      testServer.route({
        method: 'put',
        path: '/url',
        handler(request, reply) {
          reply(null, { success: true });
        }
      });
      server.methods.fetch('put', urlPath, done);
    },
    httpDelete(setup, testServer, done) {
      testServer.route({
        method: 'delete',
        path: '/url',
        handler(request, reply) {
          reply(null, { success: true });
        }
      });
      server.methods.fetch('delete', urlPath, done);
    },
    verify(get, post, put, httpDelete, done) {
      console.log(get)
      t.equal(get.success, true, 'http GET works');
      t.equal(post.success, true, 'http POST works');
      t.equal(put.success, true, 'http PUT works');
      t.equal(httpDelete.success, true, 'http DELETE works');
      done();
    },
  }, (err, result) => {
    t.equal(err, null);
    result.testServer.stop(() => {
      t.end();
    });
  });
});
