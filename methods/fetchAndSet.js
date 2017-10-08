
module.exports = function(path, key, allDone) {
  const server = this;
  server.methods.fetch('get', path, (err, result) => {
    if (err) {
      return allDone(err);
    }
    server.store.set(key, result);
    return allDone(null, result);
  });
};
