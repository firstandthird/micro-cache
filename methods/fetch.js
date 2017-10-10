const wreck = require('wreck');

module.exports = function(method, path, allDone) {
  const cacheKey = `${this.settings.app.origin}${path}`;
  wreck[method.toLowerCase()](cacheKey, (err, result, payload) => {
    if (err) {
      return allDone(err);
    }
    return allDone(null, JSON.parse(payload.toString()));
  });
};
