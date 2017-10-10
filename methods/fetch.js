const wreck = require('wreck');

module.exports = function(method, path, allDone) {
  const cacheKey = `${this.settings.app.origin}${path}`;
  async function callWreck() {
    try {
      const { res, payload } = await wreck[method.toLowerCase()](cacheKey);
      return allDone(null, JSON.parse(payload.toString()));
    } catch (e) {
      return allDone(err);
    }
  };
};
