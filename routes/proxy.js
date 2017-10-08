module.exports = {
  method: 'get',
  path: '/{path*}',
  handler: function(request, reply) {
    const requestedUrl = request.url;
    const cacheKey = server.getCacheKey(requestedUrl);
    this.get(cacheKey, (err, cachedValue) => {
      if (err) {
        return reply(err);
      }
      if (!cachedValue) {

      }
      this.log(['micro-cache', `key ${cacheKey} cache hit`]);
      return reply(null, cachedValue);
    });
  }
};
