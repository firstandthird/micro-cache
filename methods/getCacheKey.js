module.exports = function(path, query) {
  if (path.length === 1) {
    return `${this.settings.app.redis.prefix}-${path}`;
  }
  let querystring = '';
  const keys = Object.keys(query).sort();
  keys.forEach((key) => {
    querystring = `${querystring}${key}:${query[key]}`;
  });
  return `${this.settings.app.redis.prefix}-${path}-${querystring}`;
};
