const wreck = require('wreck');

module.exports = function(path, key, allDone) {
  const server = this;
  wreck.get(path, (err, response) => {
    if (err) {
      return allDone(err);
    }
    server.set(key, response);
    allDone(null, response);
  });
};
