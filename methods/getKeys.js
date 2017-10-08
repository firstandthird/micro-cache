
module.exports = function(url, done) {
  if (url.endsWith('*')) {
    return this.scan(url, done);
  }
  return done(null, [url]);
};
