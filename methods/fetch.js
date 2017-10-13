const wreck = require('wreck');

module.exports = function(method, path, options, allDone) {
  // options parameter is optional:
  if (typeof options === 'function') {
    allDone = options;
    options = {};
  }
  const cacheKey = `${this.settings.app.origin}${path}`;
  wreck[method.toLowerCase()](cacheKey, options, (err, result, payload) => {
    if (err) {
      return allDone(err);
    }
    return allDone(null, JSON.parse(payload.toString()));
  });
};
