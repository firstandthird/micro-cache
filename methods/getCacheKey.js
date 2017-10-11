const url = require('url');
const qp = require('query-parse');

module.exports = function(path, query) {
  if (path.length === 1) {
    return `${this.settings.app.redis.prefix}-${path}`;
  }
  const queryObject = qp.toObject(query);
  let querystring = '';
  const keys = Object.keys(queryObject).sort();
  keys.forEach((key) => {
    querystring = `${querystring}${key}:${queryObject[key]}`;
  });
  return `${this.settings.app.redis.prefix}-${path}-${querystring}`;
};
