
module.exports = function(path, key, allDone) {
  const server = this;
  server.methods.fetch('get', path, (err, result) => {
    if (err) {
      return allDone(err);
    }
    const store = typeof result === 'object' ? JSON.stringify(result) : result.toString();
    server.store.set(key, store);
    return allDone(null, result);
  });
};
