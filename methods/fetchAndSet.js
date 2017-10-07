const wreck = require('wreck');

module.exports = function(path, key, allDone) {
  const server = this;
  const cacheKey = `${this.settings.app.origin}${path}`;
  wreck.get(cacheKey, (err, response) => {
    if (err) {
      return allDone(err);
    }
    server.set(key, response);
    allDone(null, response);
  });
};
