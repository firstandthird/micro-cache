module.exports = function(path, query) {
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
