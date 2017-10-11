module.exports = function(path, query) {
  if (!query) {
    return `${this.settings.app.redis.prefix}-${path}`;
  }
  let querystring = '';
  const keys = Object.keys(query).sort();
  let first = true;
  keys.forEach((key) => {
    if (first) {
      querystring = `?${key}=${query[key]}`;
      first = false;
      return;
    }
    querystring = `${querystring}&${key}=${query[key]}`;
  });
  return `${this.settings.app.redis.prefix}-${path}${querystring}`;
};
