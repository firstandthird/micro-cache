module.exports = function(request) {
  const headers = this.settings.app.headers;
  const path = request.url.pathname;
  const cacheKeyObject = { path, headers: {} };
  // if any HEADERS were specified then get them:
  if (typeof headers === 'string') {
    const headerTokens = headers.toLowerCase().split(',');
    headerTokens.forEach((headerName) => {
      cacheKeyObject.headers[headerName] = request.headers[headerName];
    });
  }
  // add sorted query keys:
  const query = request.query;
  if (query) {
    const keys = Object.keys(query).sort();
    if (keys.length > 0) {
      const querystring = keys.map((key) => `${key}=${query[key]}`);
      cacheKeyObject.path += `?${querystring.join('&')}`;
    }
  }
  return `${this.settings.app.redis.prefix}-${JSON.stringify(cacheKeyObject)}`;
};
