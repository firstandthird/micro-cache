module.exports.proxy = {
  method: 'get',
  path: '/{path*}',
  handler(request, reply) {
    const server = request.server;
    const tokens = request.url.path.split('?');
    const cacheKey = server.methods.getCacheKey(tokens[0], tokens[1]);
    server.store.get(cacheKey, (err, cachedValue) => {
      if (err) {
        return reply(err);
      }
      if (cachedValue) {
        server.log(['micro-cache'], { key: cacheKey, cache: 'hit' });
        return reply(null, cachedValue);
      }
      server.methods.fetchAndSet(request.url.path, cacheKey, (originErr, originValue) => {
        if (originErr) {
          return reply(originErr);
        }
        server.log(['micro-cache'], { key: cacheKey, cache: 'miss' });
        server.store.set(cacheKey, originValue);
        return reply(null, originValue);
      });
    });
  }
};
