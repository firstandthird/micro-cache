
module.exports = function(url, done) {
  if (url.indexOf('*') !== -1) {
    return this.store.scan(url, done);
  }
  // manually see if there's a matching key
  this.store.get(url, (err, value) => {
    if (err) {
      return done(err);
    }
    if (!value) {
      return done(null, []);
    }
    return done(null, [url]);
  });
};
