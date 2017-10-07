const wreck = require('wreck');

module.exports = function(method, path, allDone) {
  const cacheKey = `${this.settings.app.origin}${path}`;
  const callWreck = async () => {
    const { res, payload } = await wreck[method.toLowerCase()](cacheKey);
    return allDone(null, JSON.parse(payload.toString()));
  };
  try {
    callWreck();
  }
  catch (err) {
    return allDone(err);
  }
};
