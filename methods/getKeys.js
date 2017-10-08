
module.exports = function(url, done) {
  if (url.endsWith('*')) {
    return this.store.scan(url, done);
  }
  return done(null, [url]);
};
