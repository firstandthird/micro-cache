const ioredis = require('ioredis');

exports.register = function(server, options, next) {
  let cache = server.settings.app.cache;
  if (options.redis.host) {
    cache = '';
  }
  // server.decorate('server', 'store', (method, url, payload, done) => {

exports.register.attributes = {
  name: 'store'
};
