const wreck = require('wreck');

module.exports = function(method, path, allDone) {
  const cacheKey = `${this.settings.app.origin}${path}`;
  wreck[method.toLowerCase()](cacheKey, {}, allDone);
};
