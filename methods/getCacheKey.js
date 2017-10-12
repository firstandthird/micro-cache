module.exports = function(request) {
  const headers = this.settings.app.headers;
  const path = request.url.path;
  const cacheKeyObject = { path, headers: {} };
  // if any HEADERS were specified then get them:
  if (typeof headers === 'string') {
    const headerTokens = headers.toLowerCase().split(',');
    headerTokens.forEach((headerName) => {
      cacheKeyObject.headers[headerName] = request.headers[headerName];
    });
  }
  return `${this.settings.app.redis.prefix}-${JSON.stringify(cacheKeyObject)}`;
};
