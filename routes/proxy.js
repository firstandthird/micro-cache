module.exports.proxy = {
  method: 'get',
  path: '/{path*}',
  handler(request, reply) {
    const server = request.server;
    const cacheKey = server.methods.getCacheKey(request);
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
