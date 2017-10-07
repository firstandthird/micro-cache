module.exports = function(url) {
  return `${this.settings.app.redis.prefix}-${url}`;
};
