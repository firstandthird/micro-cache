const url = require('url');
const qp = require('query-parse');

module.exports = function(path) {
  const tokens = path.split('?');
  if (path.length === 1) {
    return `${this.settings.app.redis.prefix}-${path}`;
  }
  const queryObject = qp.toObject(tokens[1]);
  let querystring = '';
  const keys = Object.keys(queryObject).sort();
  keys.forEach((key) => {
    querystring += `${key}:${queryObject[key]}`;
  });
  return `${this.settings.app.redis.prefix}-${tokens[0]}-${querystring}`;
};
