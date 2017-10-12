module.exports = function(request) {
  const headers = this.settings.app.headers;
  if (headers) {
    const url = `${request.connection.info.protocol}://${request.info.host}${request.url.path}`;
    const cacheKeyObject = { url, headers: {} };
    const headerTokens = headers.toLowerCase().split(',');
    headerTokens.forEach((headerName) => {
      cacheKeyObject.headers[headerName] = request.headers[headerName];
    });
    return `${this.settings.app.redis.prefix}-${JSON.stringify(cacheKeyObject)}`;
  }

  const path = request.url.pathname;
  const query = request.query;
  if (!query) {
    return `${this.settings.app.redis.prefix}-${path}`;
  }
  const keys = Object.keys(query).sort();
  if (keys.length > 0) {
    const querystring = keys.map((key) => `${key}=${query[key]}`);
    return `${this.settings.app.redis.prefix}-${path}?${querystring.join('&')}`;
  }
  return `${this.settings.app.redis.prefix}-${path}`;
};
