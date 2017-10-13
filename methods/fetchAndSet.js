
module.exports = function(obj, key, allDone) {
  const server = this;
  server.methods.fetch('get', obj.path, { headers: obj.headers }, (err, result) => {
    if (err) {
      return allDone(err);
    }
    server.store.set(key, result);
    return allDone(null, result);
  });
};
