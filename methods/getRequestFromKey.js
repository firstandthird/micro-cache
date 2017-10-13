module.exports = function(key) {
  const prefix = this.settings.app.redis.prefix;
  return JSON.parse(key.replace(`${prefix}-`, ''));
};
