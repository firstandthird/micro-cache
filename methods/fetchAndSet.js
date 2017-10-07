const wreck = require('wreck');

module.exports = function(path, key, allDone) {
  const server = this;
  const callWreck = async () => {
    const { res, payload } = await wreck.get(`${server.settings.app.origin}${path}`);
    const responsePayload = JSON.parse(payload.toString());
    server.set(key, responsePayload);
    return allDone(null, responsePayload);
  };
  try {
    callWreck();
  }
  catch (err) {
    return allDone(err);
  }
};
